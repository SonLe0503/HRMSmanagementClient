type BadgeStatus = "approved" | "pending" | "rejected" | "cancelled" | "active" | "inactive" | string;

interface MobileStatusBadgeProps {
    status: BadgeStatus;
    label?: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    approved:  { bg: "bg-green-100",  text: "text-green-700",  label: "Đã duyệt"  },
    pending:   { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ duyệt" },
    rejected:  { bg: "bg-red-100",    text: "text-red-700",    label: "Từ chối"   },
    cancelled: { bg: "bg-gray-100",   text: "text-gray-600",   label: "Đã hủy"    },
    active:    { bg: "bg-blue-100",   text: "text-blue-700",   label: "Hoạt động" },
    inactive:  { bg: "bg-gray-100",   text: "text-gray-600",   label: "Không HĐ"  },
};

const MobileStatusBadge = ({ status, label }: MobileStatusBadgeProps) => {
    const config = statusConfig[status.toLowerCase()] ?? {
        bg: "bg-gray-100",
        text: "text-gray-600",
        label: status,
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
            {label ?? config.label}
        </span>
    );
};

export default MobileStatusBadge;
