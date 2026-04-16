$ErrorActionPreference = "Stop"
$base = "http://localhost:5000"
$results = New-Object System.Collections.Generic.List[object]
function Add-Result($Test,$Pass,$Note){ $results.Add([pscustomobject]@{Test=$Test;Status=($(if($Pass){"PASS"}else{"FAIL"}));Note=$Note}) | Out-Null }
function ErrText($err){
  $status = $null
  $msg = $err.Exception.Message
  if ($err.Exception.Response) {
    try { $status = [int]$err.Exception.Response.StatusCode } catch {}
    try {
      $reader = New-Object System.IO.StreamReader($err.Exception.Response.GetResponseStream())
      $body = $reader.ReadToEnd(); $reader.Close()
      if ($body) { $msg = "$msg | $body" }
    } catch {}
  }
  if ($status) { "HTTP $status - $msg" } else { $msg }
}

$ready = $false
1..30 | ForEach-Object {
  if (-not $ready) {
    try { $ping = Invoke-RestMethod -Uri "$base/" -Method Get; if ($ping.message -eq "API running") { $ready = $true } } catch {}
  }
}
if (-not $ready) {
  Add-Result "Server startup" $false "Server not reachable on /"
  $results | Format-Table -AutoSize | Out-String | Write-Output
  exit 1
}
Add-Result "Server startup" $true "API running confirmed"

$adminEmail = "admin@soulsync.local"
$adminPassword = "Admin@12345"
if (Test-Path ".env") {
  foreach($line in Get-Content ".env"){
    if ($line -match "^\s*DEFAULT_ADMIN_EMAIL\s*=\s*(.+)\s*$") { $adminEmail = $matches[1].Trim().Trim('"').Trim("'") }
    if ($line -match "^\s*DEFAULT_ADMIN_PASSWORD\s*=\s*(.+)\s*$") { $adminPassword = $matches[1].Trim().Trim('"').Trim("'") }
  }
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$userA = @{ name="User A"; email="usera_$ts@example.com"; password="Pass@12345" }
$userB = @{ name="User B"; email="userb_$ts@example.com"; password="Pass@12345" }
$tokenAdmin=$null; $tokenA=$null; $tokenB=$null; $idA=$null; $idB=$null

try {
  $regA = Invoke-RestMethod -Method Post -Uri "$base/api/users/register" -ContentType "application/json" -Body ($userA | ConvertTo-Json)
  $idA = $regA.user.id
  Add-Result "A Register user A" ($idA -and -not $regA.user.isApproved) "id=$idA"
} catch { Add-Result "A Register user A" $false (ErrText $_) }

try {
  Invoke-RestMethod -Method Post -Uri "$base/api/users/login" -ContentType "application/json" -Body (@{email=$userA.email;password=$userA.password}|ConvertTo-Json) | Out-Null
  Add-Result "B Login A before approval" $false "Unexpectedly succeeded"
} catch {
  $txt = ErrText $_
  Add-Result "B Login A before approval" (($txt -match "HTTP 403") -and ($txt -match "pending admin approval")) $txt
}

try {
  $adminLogin = Invoke-RestMethod -Method Post -Uri "$base/api/users/login" -ContentType "application/json" -Body (@{email=$adminEmail;password=$adminPassword}|ConvertTo-Json)
  $tokenAdmin = $adminLogin.token
  Add-Result "C Admin login" (-not [string]::IsNullOrWhiteSpace($tokenAdmin)) "admin=$adminEmail"
} catch { Add-Result "C Admin login" $false (ErrText $_) }
$adminHeaders = @{ Authorization = "Bearer $tokenAdmin" }

try {
  $users = Invoke-RestMethod -Method Get -Uri "$base/api/users" -Headers $adminHeaders
  $foundA = $users | Where-Object { $_.email -eq $userA.email } | Select-Object -First 1
  if ($foundA) { $idA = $foundA.id }
  Add-Result "D Admin list users locate A" ($foundA -ne $null) "foundId=$idA"
} catch { Add-Result "D Admin list users locate A" $false (ErrText $_) }

try {
  $approveA = Invoke-RestMethod -Method Patch -Uri "$base/api/users/$idA/approval" -Headers $adminHeaders -ContentType "application/json" -Body (@{isApproved=$true}|ConvertTo-Json)
  Add-Result "E Admin approve user A" ($approveA.user.isApproved -eq $true) "approved=$($approveA.user.isApproved)"
} catch { Add-Result "E Admin approve user A" $false (ErrText $_) }

try {
  $loginA = Invoke-RestMethod -Method Post -Uri "$base/api/users/login" -ContentType "application/json" -Body (@{email=$userA.email;password=$userA.password}|ConvertTo-Json)
  $tokenA = $loginA.token
  Add-Result "F Login A after approval" (-not [string]::IsNullOrWhiteSpace($tokenA)) "id=$($loginA.user.id)"
} catch { Add-Result "F Login A after approval" $false (ErrText $_) }
$headersA = @{ Authorization = "Bearer $tokenA" }

try {
  $null = Invoke-RestMethod -Method Put -Uri "$base/api/users/me" -Headers $headersA -ContentType "application/json" -Body (@{age=28;gender="male";city="Lahore";education="BS Computer Science";bio="Profile A";preferences="female"}|ConvertTo-Json)
  $meA = Invoke-RestMethod -Method Get -Uri "$base/api/users/me" -Headers $headersA
  Add-Result "G User A update profile + /me" ($meA.user.city -eq "Lahore") "city=$($meA.user.city)"
} catch { Add-Result "G User A update profile + /me" $false (ErrText $_) }

try {
  $regB = Invoke-RestMethod -Method Post -Uri "$base/api/users/register" -ContentType "application/json" -Body ($userB | ConvertTo-Json)
  $idB = $regB.user.id
  Invoke-RestMethod -Method Patch -Uri "$base/api/users/$idB/approval" -Headers $adminHeaders -ContentType "application/json" -Body (@{isApproved=$true}|ConvertTo-Json) | Out-Null
  $loginB = Invoke-RestMethod -Method Post -Uri "$base/api/users/login" -ContentType "application/json" -Body (@{email=$userB.email;password=$userB.password}|ConvertTo-Json)
  $tokenB = $loginB.token
  $headersB = @{ Authorization = "Bearer $tokenB" }
  Invoke-RestMethod -Method Put -Uri "$base/api/users/me" -Headers $headersB -ContentType "application/json" -Body (@{age=26;gender="female";city="Lahore";education="BS Software Engineering";bio="Profile B";preferences="male"}|ConvertTo-Json) | Out-Null
  Add-Result "H Register/approve/login user B" (-not [string]::IsNullOrWhiteSpace($tokenB)) "idB=$idB"
} catch { Add-Result "H Register/approve/login user B" $false (ErrText $_) }
$headersB = @{ Authorization = "Bearer $tokenB" }

try {
  $search = Invoke-RestMethod -Method Get -Uri "$base/api/users/search?age=25&city=Lahore&gender=female&education=Software&preferences=male" -Headers $headersA
  $hasB = $search.users | Where-Object { $_.email -eq $userB.email } | Select-Object -First 1
  Add-Result "I Search approved profiles" ($hasB -ne $null) "matches=$($search.users.Count)"
} catch { Add-Result "I Search approved profiles" $false (ErrText $_) }

try {
  Invoke-RestMethod -Method Post -Uri "$base/api/interests/send" -Headers $headersA -ContentType "application/json" -Body (@{receiverId=$idB}|ConvertTo-Json) | Out-Null
  $recvInt = Invoke-RestMethod -Method Get -Uri "$base/api/interests" -Headers $headersB
  $item = $recvInt.interests | Where-Object { $_.sender.email -eq $userA.email } | Select-Object -First 1
  $accept = Invoke-RestMethod -Method Put -Uri "$base/api/interests/$($item._id)" -Headers $headersB -ContentType "application/json" -Body (@{status="accepted"}|ConvertTo-Json)
  Add-Result "J Interests send/fetch/accept" ($accept.interest.status -eq "accepted") "interestId=$($item._id)"
} catch { Add-Result "J Interests send/fetch/accept" $false (ErrText $_) }

try {
  $text = "hello-$ts"
  Invoke-RestMethod -Method Post -Uri "$base/api/messages" -Headers $headersA -ContentType "application/json" -Body (@{receiverId=$idB;content=$text}|ConvertTo-Json) | Out-Null
  $convos = Invoke-RestMethod -Method Get -Uri "$base/api/messages" -Headers $headersB
  $withA = Invoke-RestMethod -Method Get -Uri "$base/api/messages/with/$idA" -Headers $headersB
  $hasConvo = $convos.conversations | Where-Object { $_.user.email -eq $userA.email } | Select-Object -First 1
  $hasMsg = $withA.messages | Where-Object { $_.content -eq $text } | Select-Object -First 1
  Add-Result "K Messages send/conversations/with" ($hasConvo -ne $null -and $hasMsg -ne $null) "msgFound=$($hasMsg -ne $null)"
} catch { Add-Result "K Messages send/conversations/with" $false (ErrText $_) }

try {
  Invoke-RestMethod -Method Get -Uri "$base/api/users/me" | Out-Null
  Add-Result "L /api/users/me without token" $false "Unexpectedly succeeded"
} catch {
  $txt = ErrText $_
  Add-Result "L /api/users/me without token" ($txt -match "HTTP 401") $txt
}

$results | Format-Table -AutoSize | Out-String | Write-Output
