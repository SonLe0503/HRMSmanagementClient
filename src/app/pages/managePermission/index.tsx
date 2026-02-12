// import { useEffect, useState } from "react";
// import { Table, Button, Space, Card, message, Typography, Popconfirm, Tooltip } from "antd";
// import { PlusOutlined, DeleteOutlined, EditOutlined, SafetyOutlined } from "@ant-design/icons";
// import { useAppDispatch, useAppSelector } from "../../../store";
// import { fetchAllPermissions, deletePermission, selectPermissions, selectPermissionLoading } from "../../../store/permissionSlide";
// import Condition from "./Condition";
// import AddPermissionModal from "./modal/AddPermissionModal";
// import EditPermissionModal from "./modal/EditPermissionModal";

// const { Title } = Typography;

// const ManagePermission = () => {
//     const dispatch = useAppDispatch();
//     const permissions = useAppSelector(selectPermissions);
//     const loading = useAppSelector(selectPermissionLoading);

//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [editingPermission, setEditingPermission] = useState<any>(null);
//     const [searchText, setSearchText] = useState("");

//     useEffect(() => {
//         dispatch(fetchAllPermissions());
//     }, [dispatch]);

//     const handleAdd = () => {
//         setIsAddModalOpen(true);
//     };

//     const handleEdit = (record: any) => {
//         setEditingPermission(record);
//         setIsEditModalOpen(true);
//     };

//     const handleDelete = (id: number) => {
//         dispatch(deletePermission(id))
//             .unwrap()
//             .then(() => {
//                 message.success("Permission deleted successfully");
//                 dispatch(fetchAllPermissions());
//             })
//             .catch((error: any) => {
//                 const msg = typeof error === 'string' ? error : error?.message || "Failed to delete permission";
//                 message.error(msg);
//             });
//     };

//     const handleSuccess = () => {
//         setIsAddModalOpen(false);
//         setIsEditModalOpen(false);
//         dispatch(fetchAllPermissions());
//     };

//     const filteredPermissions = permissions.filter((p) => {
//         const lowerSearch = searchText.toLowerCase();
//         return (
//             p.permissionName.toLowerCase().includes(lowerSearch) ||
//             p.permissionCode.toLowerCase().includes(lowerSearch) ||
//             p.module.toLowerCase().includes(lowerSearch)
//         );
//     });

//     const columns = [
//         {
//             title: "ID",
//             dataIndex: "permissionId",
//             key: "permissionId",
//             width: 70,
//         },
//         {
//             title: "Code",
//             dataIndex: "permissionCode",
//             key: "permissionCode",
//             render: (text: string) => (
//                 <code style={{ color: "#eb2f96", background: "#fff0f6", padding: "2px 4px", borderRadius: "4px" }}>
//                     {text}
//                 </code>
//             ),
//         },
//         {
//             title: "Permission Name",
//             dataIndex: "permissionName",
//             key: "permissionName",
//             render: (text: string) => (
//                 <Space>
//                     <SafetyOutlined style={{ color: "#1890ff" }} />
//                     {text}
//                 </Space>
//             ),
//         },
//         {
//             title: "Module",
//             dataIndex: "module",
//             key: "module",
//         },
//         {
//             title: "Description",
//             dataIndex: "description",
//             key: "description",
//             ellipsis: true,
//         },
//         {
//             title: "Action",
//             key: "action",
//             width: 120,
//             render: (_: any, record: any) => (
//                 <Space size="middle">
//                     <Tooltip title="Edit">
//                         <Button
//                             type="primary"
//                             icon={<EditOutlined />}
//                             onClick={() => handleEdit(record)}
//                         />
//                     </Tooltip>
//                     <Popconfirm
//                         title="Delete permission"
//                         description="Are you sure to delete this permission?"
//                         onConfirm={() => handleDelete(record.permissionId)}
//                         okText="Yes"
//                         cancelText="No"
//                     >
//                         <Tooltip title="Delete">
//                             <Button
//                                 danger
//                                 icon={<DeleteOutlined />}
//                             />
//                         </Tooltip>
//                     </Popconfirm>
//                 </Space>
//             ),
//         },
//     ];

//     return (
//         <div className="p-2">
//             <Card
//                 title={
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                         <Title level={4} style={{ margin: 0 }}>Manage Permissions</Title>
//                         <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
//                             Add Permission
//                         </Button>
//                     </div>
//                 }
//             >
//                 <Condition
//                     searchText={searchText}
//                     setSearchText={setSearchText}
//                 />

//                 <Table
//                     columns={columns}
//                     dataSource={filteredPermissions}
//                     rowKey="permissionId"
//                     loading={loading}
//                     pagination={{ pageSize: 10 }}
//                 />
//             </Card>

//             <AddPermissionModal
//                 open={isAddModalOpen}
//                 onCancel={() => setIsAddModalOpen(false)}
//                 onSuccess={handleSuccess}
//             />

//             <EditPermissionModal
//                 open={isEditModalOpen}
//                 onCancel={() => setIsEditModalOpen(false)}
//                 onSuccess={handleSuccess}
//                 editingPermission={editingPermission}
//             />
//         </div>
//     );
// };

// export default ManagePermission;
