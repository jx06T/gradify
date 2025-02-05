import * as React from "react"

const LoadingAnimation = ({ primaryColor = "bg-white ", className = "", ...props }: { className?: string, primaryColor?: string, props?: React.HTMLProps<HTMLDivElement> }) => {
    return (
        <div {...props} className={"flex items-center justify-center w-full h-6 bg-transparent rounded-lg " + className || ""}>
            <div className="flex space-x-2">
                <div className={`w-3 h-3 rounded-full animate-[bounce_1s_ease-in-out_infinite] ${primaryColor}`} />
                <div className={`w-3 h-3 rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite] ${primaryColor}`} />
                <div className={`w-3 h-3 rounded-full animate-[bounce_1s_ease-in-out_0.4s_infinite] ${primaryColor}`} />
            </div>
        </div>
    );
};

export default LoadingAnimation