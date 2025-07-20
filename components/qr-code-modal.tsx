"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Copy, Printer } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { MODAL_TYPES } from "@/lib/constants";
import showToast from "@/lib/toast";

interface Product {
  id: string;
  reference: string;
  name: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  instanceId?: string; // For individual product instances
}

export function QRCodeModal() {
  const { activeModal, modalData, closeModal } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const isOpen = activeModal === MODAL_TYPES.QR_CODE;
  const product = modalData as Product | null;

  useEffect(() => {
    if (isOpen && product && canvasRef.current && !qrCodeGenerated) {
      generateQRCode();
    }
  }, [isOpen, product, qrCodeGenerated]);

  useEffect(() => {
    if (!isOpen) {
      setQrCodeGenerated(false);
      setIsGenerating(false);
    }
  }, [isOpen]);

  const generateQRCode = async () => {
    if (!product || !canvasRef.current || isGenerating) return;

    try {
      setIsGenerating(true);
      console.log("Starting QR code generation for product:", product);

      // Dynamic import of QRCode - using the correct import syntax
      const { default: QRCode } = await import("qrcode");

      const qrData = {
        type: "product",
        id: product.id,
        reference: product.reference, // This will be the individual instance reference if instanceId is present
        name: product.name,
        instanceId: product.instanceId || null, // Include instance ID if this is an individual instance
        timestamp: new Date().toISOString(),
      };

      const qrString = JSON.stringify(qrData);
      console.log("QR data prepared:", qrData);

      await QRCode.toCanvas(canvasRef.current, qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      setQrCodeGenerated(true);
      console.log("QR Code generated successfully");
    } catch (error) {
      console.error("Error generating QR code:", error);
      showToast.error("Failed to generate QR code", "Please try again");
      setQrCodeGenerated(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current || !product) return;

    try {
      const link = document.createElement("a");
      link.download = `qr-${product.reference}-${product.name.replace(/\s+/g, "-")}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
      showToast.success("QR code downloaded successfully");
    } catch (error) {
      console.error("Failed to download QR code:", error);
      showToast.error("Failed to download QR code");
    }
  };

  const copyQRData = async () => {
    if (!product) return;

    const qrData = {
      type: "product",
      id: product.id,
      reference: product.reference,
      name: product.name,
      ...(product.instanceId && { instanceId: product.instanceId }),
      timestamp: new Date().toISOString(),
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(qrData, null, 2));
      showToast.success("QR code data copied to clipboard");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      try {
        const textArea = document.createElement("textarea");
        textArea.value = JSON.stringify(qrData, null, 2);
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showToast.success("QR code data copied to clipboard");
      } catch (fallbackError) {
        showToast.error("Failed to copy to clipboard");
      }
    }
  };

  const printQRCode = () => {
    if (!canvasRef.current || !product) return;

    try {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL();

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>QR Code - ${product.reference}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
                margin: 0;
              }
              .qr-container {
                display: inline-block;
                border: 2px solid #ccc;
                padding: 20px;
                border-radius: 10px;
                background: white;
              }
              .product-info {
                margin-top: 15px;
                font-size: 14px;
              }
              .product-reference {
                font-weight: bold;
                font-size: 16px;
                color: #333;
              }
              .product-name {
                color: #666;
                margin-top: 5px;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${dataUrl}" alt="QR Code" style="max-width: 300px; height: auto;" />
              <div class="product-info">
                <div class="product-reference">${product.reference}</div>
                <div class="product-name">${product.name}</div>
              </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              }
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
        showToast.success("Print dialog opened");
      }
    } catch (error) {
      console.error("Failed to print QR code:", error);
      showToast.error("Failed to print QR code");
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-md animate-in scale-in">
        <DialogHeader>
          <DialogTitle>
            {product.instanceId
              ? "Individual Instance QR Code"
              : "Product QR Code"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
            <canvas
              ref={canvasRef}
              className={`${qrCodeGenerated ? "block" : "hidden"}`}
              style={{ maxWidth: "100%", height: "auto" }}
            />
            {(isGenerating || !qrCodeGenerated) && (
              <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-100 rounded">
                <div className="loading-spinner h-8 w-8" />
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="font-semibold text-lg">{product.reference}</p>
            <p className="text-sm text-muted-foreground">{product.name}</p>
            {product.instanceId && (
              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Individual Instance
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-md w-full">
            <p className="font-medium mb-1">QR Code contains:</p>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(
                {
                  type: "product",
                  id: product.id,
                  reference: product.reference,
                  name: product.name,
                  ...(product.instanceId && { instanceId: product.instanceId }),
                },
                null,
                2,
              )}
            </pre>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={downloadQRCode}
              variant="outline"
              size="sm"
              disabled={!qrCodeGenerated}
              className="btn-enhanced bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button
              onClick={copyQRData}
              variant="outline"
              size="sm"
              className="btn-enhanced bg-transparent"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Data
            </Button>
            <Button
              onClick={printQRCode}
              variant="outline"
              size="sm"
              disabled={!qrCodeGenerated}
              className="btn-enhanced bg-transparent"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
