export default function UserCard({ user, onSendInterest }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{user.name}</h2>
            
            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-semibold text-gray-800">{user.age}</span>
                </div>
                
                <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-semibold text-gray-800">{user.city}</span>
                </div>
                
                <div className="flex justify-between">
                    <span className="text-gray-600">Education:</span>
                    <span className="font-semibold text-gray-800">{user.education}</span>
                </div>
            </div>
            
            <button
                onClick={() => onSendInterest(user.id)}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
                Send Interest
            </button>
        </div>
    );
}