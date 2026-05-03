import type { ReactNode } from "react";
import { RightOutlined } from "@ant-design/icons";

interface MobileListItemProps {
    title: string;
    subtitle?: string;
    right?: ReactNode;
    onClick?: () => void;
    showArrow?: boolean;
}

const MobileListItem = ({ title, subtitle, right, onClick, showArrow = true }: MobileListItemProps) => {
    return (
        <div
            className={`flex items-center justify-between py-3 px-4 bg-white border-b border-gray-100 last:border-b-0 ${onClick ? "cursor-pointer active:bg-gray-50 transition-colors" : ""}`}
            onClick={onClick}
        >
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate">{title}</span>
                {subtitle && <span className="text-xs text-gray-400 truncate">{subtitle}</span>}
            </div>
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                {right}
                {onClick && showArrow && <RightOutlined className="text-gray-300 text-xs" />}
            </div>
        </div>
    );
};

export default MobileListItem;
