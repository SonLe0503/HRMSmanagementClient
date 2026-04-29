import type { ReactNode, CSSProperties } from "react";

interface MobileCardProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
}

const MobileCard = ({ children, className = "", style, onClick }: MobileCardProps) => {
    return (
        <div
            className={`bg-white rounded-2xl p-4 shadow-sm ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default MobileCard;
