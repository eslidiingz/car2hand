interface ToastProps {
    message: string;
    type: string;
}

const Toast = ({ message, type }: ToastProps) => {
    return (
        <div
            className={`fixed z-50 left-0 right-0 mx-auto bottom-22 lg:bottom-8 flex justify-center items-center gap-2`}
        >
            <div className={`mx-4 px-4 py-2.5 rounded-xl shadow-lg ${type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
                } `}>
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    )
}

export default Toast