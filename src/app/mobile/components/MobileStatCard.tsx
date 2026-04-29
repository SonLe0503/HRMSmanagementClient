type StatColor = "blue" | "green" | "orange" | "red" | "gray";

interface MobileStatCardProps {
    label: string;
    value: string | number;
    color?: StatColor;
    unit?: string;
}

const colorMap: Record<StatColor, { bg: string; text: string; value: string }> = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-500",   value: "text-blue-700"   },
    green:  { bg: "bg-green-50",  text: "text-green-500",  value: "text-green-700"  },
    orange: { bg: "bg-orange-50", text: "text-orange-500", value: "text-orange-700" },
    red:    { bg: "bg-red-50",    text: "text-red-500",    value: "text-red-700"    },
    gray:   { bg: "bg-gray-50",   text: "text-gray-500",   value: "text-gray-700"   },
};

const MobileStatCard = ({ label, value, color = "blue", unit }: MobileStatCardProps) => {
    const c = colorMap[color];
    return (
        <div className={`${c.bg} rounded-2xl p-3 flex flex-col gap-1`}>
            <span className={`text-xs font-medium ${c.text}`}>{label}</span>
            <span className={`text-2xl font-bold ${c.value}`}>
                {value}
                {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
            </span>
        </div>
    );
};

export default MobileStatCard;
