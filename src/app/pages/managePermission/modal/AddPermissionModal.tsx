// import { Modal, Form, Input, message } from "antd";
// import { useAppDispatch, useAppSelector } from "../../../../store";
// import { createPermission, selectPermissionLoading } from "../../../../store/permissionSlide";

// interface AddPermissionModalProps {
//     open: boolean;
//     onCancel: () => void;
//     onSuccess: () => void;
// }

// const AddPermissionModal = ({ open, onCancel, onSuccess }: AddPermissionModalProps) => {
//     const [form] = Form.useForm();
//     const dispatch = useAppDispatch();
//     const loading = useAppSelector(selectPermissionLoading);

//     const onFinish = (values: any) => {
//         dispatch(createPermission(values))
//             .unwrap()
//             .then(() => {
//                 message.success("Permission created successfully");
//                 form.resetFields();
//                 onSuccess();
//             })
//             .catch((error: any) => {
//                 const msg = typeof error === 'string' ? error : error?.message || "Failed to create permission";
//                 message.error(msg);
//             });
//     };

//     return (
//         <Modal
//             title="Add New Permission"
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
//                     rules={[{ required: true, message: "Please input the permission code!" }]}
//                 >
//                     <Input placeholder="E.g. USER_VIEW" />
//                 </Form.Item>

//                 <Form.Item
//                     name="permissionName"
//                     label="Permission Name"
//                     rules={[{ required: true, message: "Please input the permission name!" }]}
//                 >
//                     <Input placeholder="E.g. View User List" />
//                 </Form.Item>

//                 <Form.Item
//                     name="module"
//                     label="Module"
//                     rules={[{ required: true, message: "Please input the module name!" }]}
//                 >
//                     <Input placeholder="E.g. UserManagement" />
//                 </Form.Item>

//                 <Form.Item
//                     name="description"
//                     label="Description"
//                 >
//                     <Input.TextArea rows={4} placeholder="Decribe the permission" />
//                 </Form.Item>
//             </Form>
//         </Modal>
//     );
// };

// export default AddPermissionModal;
