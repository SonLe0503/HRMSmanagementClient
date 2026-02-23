import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { createTask, fetchAllTasks } from "../../../../store/taskSlide";
import { fetchAllUsers, selectUsers } from "../../../../store/userSlide";
import type { IUser } from "../../../../store/userSlide";
import dayjs from "dayjs";

interface AddTaskModalProps {
    open: boolean;
    onCancel: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const allUsers = useAppSelector(selectUsers);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            dispatch(fetchAllUsers());
        }
    }, [open, dispatch]);

    const onFinish = (values: any) => {
        setLoading(true);
        const submitData = {
            ...values,
            dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : undefined,
        };

        dispatch(createTask(submitData))
            .unwrap()
            .then(() => {
                message.success("Task created successfully");
                form.resetFields();
                onCancel();
                dispatch(fetchAllTasks());
            })
            .catch((err: any) => {
                message.error(err || "Failed to create task");
            })
            .finally(() => setLoading(false));
    };

    return (
        <Modal
            title="Create New Task"
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ priority: 'Medium' }}
            >
                <Form.Item
                    name="taskTitle"
                    label="Task Title"
                    rules={[{ required: true, message: 'Please enter task title' }]}
                >
                    <Input placeholder="Enter task title" />
                </Form.Item>

                <Form.Item
                    name="taskType"
                    label="Task Type"
                    rules={[{ required: true, message: 'Please enter task type' }]}
                >
                    <Input placeholder="Enter task type (e.g. Leave Approval, Research...)" />
                </Form.Item>

                <Form.Item
                    name="assignedTo"
                    label="Assign To"
                    rules={[{ required: true, message: 'Please select a user' }]}
                >
                    <Select
                        showSearch
                        placeholder="Select user"
                        optionFilterProp="children"
                    >
                        {allUsers.map((user: IUser) => (
                            <Select.Option key={user.userId} value={user.userId}>
                                {user.username} ({user.email})
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="priority"
                    label="Priority"
                    rules={[{ required: true }]}
                >
                    <Select>
                        <Select.Option value="High">High</Select.Option>
                        <Select.Option value="Medium">Medium</Select.Option>
                        <Select.Option value="Low">Low</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="dueDate"
                    label="Due Date"
                >
                    <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
                </Form.Item>

                <Form.Item
                    name="taskDescription"
                    label="Description"
                >
                    <Input.TextArea rows={4} placeholder="Enter task description" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddTaskModal;
