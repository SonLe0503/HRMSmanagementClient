// import { useEffect } from "react";
// import { Modal, Form, Input, message } from "antd";
// import { useAppDispatch, useAppSelector } from "../../../../store";
// import { updatePermission, selectPermissionLoading } from "../../../../store/permissionSlide";

// interface EditPermissionModalProps {
//     open: boolean;
//     onCancel: () => void;
//     onSuccess: () => void;
//     editingPermission: any;
// }

// const EditPermissionModal = ({ open, onCancel, onSuccess, editingPermission }: EditPermissionModalProps) => {
//     const [form] = Form.useForm();
//     const dispatch = useAppDispatch();
//     const loading = useAppSelector(selectPermissionLoading);

//     useEffect(() => {
//         if (open && editingPermission) {
//             form.setFieldsValue(editingPermission);
//         }
//     }, [open, editingPermission, form]);

//     const onFinish = (values: any) => {
//         dispatch(updatePermission({ id: editingPermission.permissionId, data: values }))
//             .unwrap()
//             .then(() => {
//                 message.success("Permission updated successfully");
//                 onSuccess();
//             })
//             .catch((error: any) => {
//                 const msg = typeof error === 'string' ? error : error?.message || "Failed to update permission";
//                 message.error(msg);
//             });
//     };

//     return (
//         <Modal
//             title="Edit Permission"
//             open={open}
//             onCancel={() => {
//                 form.resetFields();
//                 onCancel();
//             }}
//             onOk={() => form.submit()}
//             confirmLoading={loading}
//             destroyOnHidden
//         >
//             <Form
//                 form={form}
//                 layout="vertical"
//                 onFinish={onFinish}
//             >
//                 <Form.Item
//                     name="permissionCode"
//                     label="Permission Code"
//                 >
//                     <Input disabled />
//                 </Form.Item>

//                 <Form.Item
//                     name="permissionName"
//                     label="Permission Name"
//                     rules={[{ required: true, message: "Please input the permission name!" }]}
//                 >
//                     <Input />
//                 </Form.Item>

//                 <Form.Item
//                     name="module"
//                     label="Module"
//                     rules={[{ required: true, message: "Please input the module name!" }]}
//                 >
//                     <Input />
//                 </Form.Item>

//                 <Form.Item
//                     name="description"
//                     label="Description"
//                 >
//                     <Input.TextArea rows={4} />
//                 </Form.Item>
//             </Form>
//         </Modal>
//     );
// };

// export default EditPermissionModal;
