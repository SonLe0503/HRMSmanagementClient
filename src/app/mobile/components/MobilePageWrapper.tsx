import type { ReactNode } from "react";

interface MobilePageWrapperProps {
    title?: string;
    children: ReactNode;
    headerRight?: ReactNode;
    noPadding?: boolean;
}

const MobilePageWrapper = ({ title, children, headerRight, noPadding = false }: MobilePageWrapperProps) => {
    return (
        <div className="flex flex-col min-h-full">
            {title && (
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-lg font-bold text-gray-800">{title}</h1>
                    {headerRight && <div>{headerRight}</div>}
                </div>
            )}
            <div className={noPadding ? "-mx-4" : ""}>{children}</div>
        </div>
    );
};

export default MobilePageWrapper;
