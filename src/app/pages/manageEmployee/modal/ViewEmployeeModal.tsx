import { useEffect } from "react";
import { Modal, Descriptions, Tag, Spin, Divider } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchEmployeeById, selectSelectedEmployee, selectEmployeeLoading, clearSelectedEmployee } from "../../../../store/employeeSlide";

interface ViewEmployeeModalProps {
    open: boolean;
    onCancel: () => void;
    employeeId: number | null;
}

const STATUS_COLOR: Record<string, string> = {
    Active: "green",
    Inactive: "default",
    Resigned: "red",
    Terminated: "red",
    "On Leave": "orange",
};

const ViewEmployeeModal = ({ open, onCancel, employeeId }: ViewEmployeeModalProps) => {
    const dispatch = useAppDispatch();
    const employee = useAppSelector(selectSelectedEmployee);
    const loading = useAppSelector(selectEmployeeLoading);

    useEffect(() => {
        if (open && employeeId !== null) {
            dispatch(fetchEmployeeById(employeeId));
        }
        if (!open) {
            dispatch(clearSelectedEmployee());
        }
    }, [open, employeeId, dispatch]);

    const formatDate = (d: string | null) => {
        if (!d) return "—";
        const date = new Date(d);
        return date.toLocaleDateString("vi-VN");
    };

    const formatCurrency = (v: number | null) => {
        if (v === null || v === undefined) return "—";
        return v.toLocaleString("vi-VN") + " VND";
    };

    return (
        <Modal
            title={`Chi tiết nhân viên${employee ? `: ${employee.fullName}` : ""}`}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnHidden
        >
            {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Spin size="large" />
                </div>
            ) : employee ? (
                <>
                    <Divider>Thông tin cá nhân</Divider>
                    <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Mã nhân viên">{employee.employeeCode}</Descriptions.Item>
                        <Descriptions.Item label="Họ và tên">{employee.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{employee.phone ?? "—"}</Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">{formatDate(employee.dateOfBirth)}</Descriptions.Item>
                        <Descriptions.Item label="Giới tính">{employee.gender ?? "—"}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={2}>{employee.address ?? "—"}</Descriptions.Item>
                        <Descriptions.Item label="Thành phố">{employee.city ?? "—"}</Descriptions.Item>
                        <Descriptions.Item label="Quốc gia">{employee.country ?? "—"}</Descriptions.Item>
                    </Descriptions>

                    <Divider>Thông tin công việc</Divider>
                    <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Phòng ban">{employee.departmentName ?? "—"}</Descriptions.Item>
                        <Descriptions.Item label="Chức vụ">{employee.positionName ?? "—"}</Descriptions.Item>
                        <Descriptions.Item label="Quản lý trực tiếp">{employee.managerName ?? "—"}</Descriptions.Item>
                        <Descriptions.Item label="Lương cơ bản">{formatCurrency(employee.baseSalary)}</Descriptions.Item>
                        <Descriptions.Item label="Ngày vào làm">{formatDate(employee.joinDate)}</Descriptions.Item>
                        <Descriptions.Item label="Ngày nghỉ việc">{formatDate(employee.resignationDate)}</Descriptions.Item>
                        <Descriptions.Item label="Loại hình">{employee.employmentType}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={STATUS_COLOR[employee.employmentStatus] ?? "default"}>
                                {employee.employmentStatus}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </>
            ) : null}
        </Modal>
    );
};

export default ViewEmployeeModal;
