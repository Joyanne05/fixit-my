"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Image as ImageIcon, X, Circle } from 'lucide-react';

interface QuickReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImageSelected: (file: File) => void;
    onGalleryClick: () => void;
}

export default function QuickReportModal({ isOpen, onClose, onImageSelected, onGalleryClick }: QuickReportModalProps) {
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Stop camera stream
    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    // Cleanup on close or unmount
    useEffect(() => {
        if (!isOpen) {
            setShowCamera(false);
            setCameraError(null);
            stopStream();
        }
        return () => stopStream();
    }, [isOpen, stopStream]);

    // Start camera when showCamera becomes true
    useEffect(() => {
        if (showCamera && isOpen) {
            const startCamera = async () => {
                try {
                    setCameraError(null);
                    // Request 4:3 aspect ratio from camera
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: 'environment',
                            aspectRatio: { ideal: 4 / 3 }
                        }
                    });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Camera error:", err);
                    setCameraError("Unable to access camera. Please check permissions.");
                }
            };
            startCamera();
        }
    }, [showCamera, isOpen]);



    const handleCameraClick = () => {
        setShowCamera(true);
    };

    const handleGalleryClick = () => {
        onClose();
        onGalleryClick();
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Calculate 4:3 crop from video center
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            let cropWidth, cropHeight, cropX, cropY;

            // Determine crop dimensions for 4:3
            if (videoWidth / videoHeight > 4 / 3) {
                // Video is wider than 4:3, crop sides
                cropHeight = videoHeight;
                cropWidth = videoHeight * (4 / 3);
                cropX = (videoWidth - cropWidth) / 2;
                cropY = 0;
            } else {
                // Video is taller than 4:3, crop top/bottom
                cropWidth = videoWidth;
                cropHeight = videoWidth * (3 / 4);
                cropX = 0;
                cropY = (videoHeight - cropHeight) / 2;
            }

            // Set canvas to 4:3 output dimensions
            canvas.width = cropWidth;
            canvas.height = cropHeight;

            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    stopStream();
                    onImageSelected(file);
                    onClose();
                }
            }, 'image/jpeg', 0.9);
        }
    };

    const handleBackFromCamera = () => {
        stopStream();
        setShowCamera(false);
        setCameraError(null);
    };

    if (!isOpen) return null;

    // Fullscreen camera view
    if (showCamera) {
        return (
            <div className="fixed inset-0 z-[100] bg-black">
                {/* Camera Header */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent safe-area-inset-top">
                    <button
                        onClick={handleBackFromCamera}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={28} />
                    </button>
                    <span className="text-white font-semibold text-lg">Take Photo</span>
                    <div className="w-12" />
                </div>

                {/* Video Feed - Fullscreen */}
                {cameraError ? (
                    <div className="h-full flex items-center justify-center text-white text-center p-6">
                        <div>
                            <Camera size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-2">Camera Access Denied</p>
                            <p className="text-sm text-white/60 mb-4">{cameraError}</p>
                            <button
                                onClick={handleBackFromCamera}
                                className="px-6 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors font-medium"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}

                {/* 4:3 Frame Overlay */}
                {!cameraError && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[90%] aspect-[4/3] border-2 border-white/40 rounded-2xl" />
                    </div>
                )}

                {/* Capture Button */}
                {!cameraError && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center p-8 pb-12 bg-gradient-to-t from-black/70 to-transparent">
                        <button
                            onClick={capturePhoto}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-white/30"
                        >
                            <Circle size={64} className="text-gray-200" fill="currentColor" />
                        </button>
                    </div>
                )}

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        );
    }

    // Menu View (Modal)
    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-t-3xl overflow-hidden animate-slide-up p-6 pb-10">
                {/* Handle */}
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Quick Report</h2>
                <p className="text-gray-500 text-sm text-center mb-6">Choose how you want to add your photo</p>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Camera Option */}
                    <button
                        onClick={handleCameraClick}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-brand-bg-light rounded-2xl border-2 border-transparent hover:border-brand-primary transition-all group"
                    >
                        <div className="w-14 h-14 bg-brand-primary rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Camera size={28} />
                        </div>
                        <span className="font-semibold text-gray-900">Take Photo</span>
                        <span className="text-xs text-gray-500">Open camera</span>
                    </button>

                    {/* Gallery Option */}
                    <button
                        onClick={handleGalleryClick}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-blue-50 rounded-2xl border-2 border-transparent hover:border-blue-400 transition-all group"
                    >
                        <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <ImageIcon size={28} />
                        </div>
                        <span className="font-semibold text-gray-900">Gallery</span>
                        <span className="text-xs text-gray-500">Choose existing</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

