
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
    return (
        <div className="bg-gray-800 text-white p-4 rounded shadow-lg">
            <div className="flex justify-between items-center">
                <span>{message}</span>
                <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-200">
                    &times;
                </button>
            </div>
        </div>
    );
};

export default Toast;