import React, { useState, useRef, useCallback, useEffect } from "react";
import { Modal, Button, Space, Typography, Spin } from "antd";
import Webcam from "react-webcam";
import { CameraOutlined, RetweetOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface CameraCaptureModalProps {
    open: boolean;
    title: string;
    onCancel: () => void;
    onCapture: (base64Image: string) => void;
    loading?: boolean;
}

const videoConstraints = {
    width: 480,
    height: 480,
    facingMode: "user",
};

const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ open, title, onCancel, onCapture, loading = false }) => {
    const webcamRef = useRef<Webcam>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    useEffect(() => {
        if (open) {
            setImage(null);
            setIsCameraReady(false);
        }
    }, [open]);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImage(imageSrc);
        }
    }, [webcamRef]);

    const handleRetake = () => {
        setImage(null);
    };

    const handleConfirm = () => {
        if (image) {
            onCapture(image);
        }
    };

    const handleCancel = () => {
        setImage(null);
        setIsCameraReady(false);
        onCancel();
    };

    const handleUserMedia = () => {
        setIsCameraReady(true);
    };

    return (
        <Modal
            title={title}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={520}
            destroyOnHidden
        >
            <div className="flex flex-col items-center p-4">
                <div className="relative w-full max-w-[400px] aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                    {!image ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            onUserMedia={handleUserMedia}
                            onUserMediaError={() => setIsCameraReady(false)}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img src={image} alt="Capture" className="w-full h-full object-cover" />
                    )}
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center">
                            <Spin size="large" />
                            <Text className="mt-2 font-medium">Đang xác minh...</Text>
                        </div>
                    )}
                </div>

                <div className="mt-6 w-full flex justify-center">
                    {!image ? (
                        <Button
                            type="primary"
                            icon={<CameraOutlined />}
                            size="large"
                            onClick={capture}
                            disabled={loading || !isCameraReady}
                        >
                            {isCameraReady ? "Chụp ảnh xác minh" : "Đang khởi động Camera..."}
                        </Button>
                    ) : (
                        <Space className="w-full justify-center">
                            <Button
                                icon={<RetweetOutlined />}
                                onClick={handleRetake}
                                disabled={loading}
                            >
                                Chụp lại
                            </Button>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={handleConfirm}
                                loading={loading}
                            >
                                Xác nhận {title}
                            </Button>
                        </Space>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <Text type="secondary" className="text-sm">
                        Đảm bảo khuôn mặt của bạn nằm trong khung hình và đủ ánh sáng.
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default CameraCaptureModal;
