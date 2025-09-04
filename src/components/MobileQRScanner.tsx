import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, Scan } from "lucide-react";
import { toast } from 'sonner';

interface MobileQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const MobileQRScanner = ({ isOpen, onClose, onScan }: MobileQRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsScanning(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      toast.error('Camera access required for QR scanning');
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simple QR detection simulation (in real app, use a QR library like jsQR)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Mock QR detection - in production, use jsQR or similar
    setTimeout(() => {
      // Simulate finding a Solana Pay URL
      const mockSolanaPayUrl = 'solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v?amount=10&reference=demo';
      onScan(mockSolanaPayUrl);
      toast.success('QR Code detected!');
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scan QR Code
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-gray-900 rounded-lg object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 border-2 border-white rounded-lg">
              <div className="absolute top-4 left-4 w-6 h-6 border-l-4 border-t-4 border-green-500"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-r-4 border-t-4 border-green-500"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-4 border-b-4 border-green-500"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-4 border-b-4 border-green-500"></div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Point your camera at a Solana Pay QR code
            </p>
            
            {isScanning && (
              <Button onClick={captureFrame} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Capture & Scan
              </Button>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> Make sure the QR code is clearly visible and well-lit for best results.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
