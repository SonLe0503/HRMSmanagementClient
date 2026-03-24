import { Modal, Form, Input, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../../store";
import { changePassword } from "../../../store/authSlide";
import { useState } from "react";

interface ChangePasswordModalProps {
    open: boolean;
    onCancel: () => void;
}

const ChangePasswordModal = ({ open, onCancel }: ChangePasswordModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

    const onFinish = (values: any) => {
        setLoading(true);
        dispatch(changePassword(values)).then((res: any) => {
            if (!res.error) {
                message.success("Đổi mật khẩu thành công.");
                form.resetFields();
                onCancel();
            } else {
                message.error(res.payload?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
            }
        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <Modal
            title={<span className="text-xl font-bold text-gray-800">Đổi Mật Khẩu</span>}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            confirmLoading={loading}
            centered
            width={400}
            destroyOnClose
            className="change-password-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                className="pt-4"
            >
                <Form.Item
                    name="currentPassword"
                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Mật khẩu hiện tại</span>}
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
                >
                    <Input.Password
                        size="large"
                        prefix={<LockOutlined className="text-slate-300 mr-2" />}
                        className="rounded-xl h-12 border-slate-100 bg-slate-50/50"
                        placeholder="••••••••"
                    />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Mật khẩu mới</span>}
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới" },
                        { min: 6, message: "Mật khẩu phải từ 6 ký tự trở lên" }
                    ]}
                >
                    <Input.Password
                        size="large"
                        prefix={<LockOutlined className="text-slate-300 mr-2" />}
                        className="rounded-xl h-12 border-slate-100 bg-slate-50/50"
                        placeholder="••••••••"
                    />
                </Form.Item>

                <Form.Item
                    name="confirmNewPassword"
                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Xác nhận mật khẩu mới</span>}
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        size="large"
                        prefix={<LockOutlined className="text-slate-300 mr-2" />}
                        className="rounded-xl h-12 border-slate-100 bg-slate-50/50"
                        placeholder="••••••••"
                    />
                </Form.Item>
            </Form>
            <style>{`
                .change-password-modal .ant-modal-content {
                    border-radius: 24px;
                    padding: 24px 32px;
                }
            `}</style>
        </Modal>
    );
};

export default ChangePasswordModal;
