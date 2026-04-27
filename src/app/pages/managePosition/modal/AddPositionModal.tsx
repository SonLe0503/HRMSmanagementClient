import { Modal, Form, Input, InputNumber, message, Checkbox, AutoComplete } from "antd";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createPosition, selectPositionLoading } from "../../../../store/positionSlide";
import { useNavigate } from "react-router-dom";
import { POSITION_SUGGESTIONS } from "../../../../constants/suggestions";

interface AddPositionModalProps {
    open: boolean;
    onCancel: () => void;
}

const AddPositionModal = ({ open, onCancel }: AddPositionModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const loading = useAppSelector(selectPositionLoading);
    const [nameOptions, setNameOptions] = useState<{ value: string }[]>([]);

    const onFinish = (values: any) => {
        dispatch(createPosition(values)).then((res: any) => {
            if (!res.error) {
                message.success("Tạo chức vụ thành công");
                form.resetFields();
                onCancel();
                navigate(`/hr/manage-position/${res.payload.positionId}`);
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Tạo chức vụ thất bại";
                message.error(msg);
            }
        });
    };

    const handleNameSearch = (text: string) => {
        const filtered = POSITION_SUGGESTIONS.filter((s) =>
            s.name.toLowerCase().includes(text.toLowerCase())
        );
        setNameOptions(filtered.map((s) => ({ value: s.name })));
    };

    const handleNameSelect = (value: string) => {
        const match = POSITION_SUGGESTIONS.find((s) => s.name === value);
        if (match) {
            form.setFieldsValue({
                positionName: match.name,
                level: match.level,
                isTopLevel: match.isTopLevel,
            });
        }
    };

    return (
        <Modal
            title="Thêm chức vụ mới"
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ level: 1 }}
            >
                <Form.Item
                    name="positionName"
                    label="Tên chức vụ"
                    rules={[{ required: true, message: "Vui lòng nhập tên chức vụ!" }]}
                >
                    <AutoComplete
                        options={nameOptions}
                        onSearch={handleNameSearch}
                        onSelect={handleNameSelect}
                        onFocus={() => setNameOptions(POSITION_SUGGESTIONS.map((s) => ({ value: s.name })))}
                        onBlur={() => setNameOptions([])}
                    >
                        <Input maxLength={100} placeholder="Nhập hoặc chọn tên chức vụ" />
                    </AutoComplete>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea maxLength={500} />
                </Form.Item>

                <Form.Item
                    name="level"
                    label="Cấp bậc"
                    rules={[{ required: true, message: "Vui lòng nhập cấp bậc (1-10)!" }]}
                >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="isTopLevel"
                    valuePropName="checked"
                >
                    <Checkbox>Là chức vụ quản lý cấp cao</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddPositionModal;
