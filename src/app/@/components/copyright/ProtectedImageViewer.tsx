'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui-admin/badge";
import { Shield, Download, AlertTriangle } from 'lucide-react';

interface ProtectedImageViewerProps {
  imageUrl: string;
  postInfo: {
    download_protected: boolean;
    license_type: string;
    watermark_enabled: boolean;
    user_name: string;
  };
}

export default function ProtectedImageViewer({ imageUrl, postInfo }: ProtectedImageViewerProps) {
  const [showDownloadWarning, setShowDownloadWarning] = useState(false);

  const handleRightClick = (e: React.MouseEvent) => {
    if (postInfo.download_protected) {
      e.preventDefault();
      setShowDownloadWarning(true);
      setTimeout(() => setShowDownloadWarning(false), 3000);
    }
  };

  const handleDownloadAttempt = () => {
    if (postInfo.download_protected) {
      setShowDownloadWarning(true);
      setTimeout(() => setShowDownloadWarning(false), 3000);
    }
  };

  const displayUrl = postInfo.download_protected
    ? `http://localhost:5001/api/download/protected-image?url=${encodeURIComponent(imageUrl)}`
    : imageUrl;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Protected Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image */}
        <div className="relative">
          <img
            src={displayUrl}
            alt="Protected content"
            className="w-full rounded-lg"
            draggable={false}
            onContextMenu={(e) => postInfo.download_protected && e.preventDefault()}
            onDragStart={(e) => postInfo.download_protected && e.preventDefault()}
          />
          
          {postInfo.watermark_enabled && (
            <Badge className="absolute top-2 right-2 bg-black/50 text-white">
              Watermarked
            </Badge>
          )}
        </div>

        {/* Protection Info */}
        <div className="space-y-2">
          {postInfo.download_protected && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Download protection enabled</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>© 2024 {postInfo.user_name}</span>
            <Badge variant="outline">{postInfo.license_type}</Badge>
          </div>
        </div>

        {/* Download Button */}
        {!postInfo.download_protected ? (
          <Button className="w-full" onClick={() => window.open(imageUrl, '_blank')}>
            Download
          </Button>
        ) : (
          <Button className="w-full" disabled>Download Protected</Button>
        )}

        {/* Warning Message */}
        {showDownloadWarning && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              This image is protected from unauthorized downloads.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
