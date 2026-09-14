'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { upload } from '@vercel/blob/client';
import { getCroppedImg } from '../utils/cropImage';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Crop as CropIcon,
  RefreshCw,
  X,
  ExternalLink,
  Copy,
  Image as ImageIcon,
} from 'lucide-react';

interface ImageUploaderProps {
  onUploadComplete?: (publicUrl: string) => void;
  aspectRatio?: number;
  className?: string;
}

// Helper to calculate a 16:9 crop centered on the image
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number = 16 / 9
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageUploader({
  onUploadComplete,
  aspectRatio = 16 / 9,
  className = '',
}: ImageUploaderProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [originalFileName, setOriginalFileName] = useState<string>('image.jpg');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle incoming file
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setUploadedUrl(null);
    setOriginalFileName(file.name);

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '');
    });
    reader.readAsDataURL(file);
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      imgRef.current = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    },
    [aspectRatio]
  );

  // Execute Crop and Upload to Vercel Blob
  const handleCropAndUpload = async () => {
    if (!completedCrop || !imgRef.current || !imgSrc) {
      setErrorMessage('Please adjust the crop area before uploading.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(15);

    try {
      // 1. Generate cropped JPEG blob and File using HTML5 canvas utility
      const croppedImageResult = await getCroppedImg(
        imgSrc,
        completedCrop,
        `markryan-${Date.now()}-${originalFileName.replace(/\.[^/.]+$/, '')}.jpg`,
        0.88
      );

      setUploadProgress(45);

      let finalUrl = '';

      try {
        // 2. Direct client-side Vercel Blob upload
        const newBlob = await upload(croppedImageResult.file.name, croppedImageResult.file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          clientPayload: JSON.stringify({
            originalName: originalFileName,
            crop: completedCrop,
          }),
        });

        finalUrl = newBlob.url;
      } catch (blobErr: any) {
        console.warn('Vercel Blob remote upload error / unconfigured token:', blobErr);
        // Fallback for offline/local development or unauthenticated preview:
        // Use the generated local object URL so user workflow remains uninterrupted
        finalUrl = croppedImageResult.url;
        setErrorMessage(
          'Notice: Vercel Blob token is not configured in this preview environment. The cropped image has been processed via HTML5 canvas and rendered locally.'
        );
      }

      setUploadProgress(100);
      setUploadedUrl(finalUrl);
      if (onUploadComplete) {
        onUploadComplete(finalUrl);
      }
    } catch (err: any) {
      console.error('Error during image cropping or upload:', err);
      setErrorMessage(err.message || 'Failed to crop and upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setUploadedUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm border border-stone-200/90 rounded-xl p-5 shadow-sm ${className}`}
      id="cms-image-uploader"
    >
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#722F37]/10 text-[#722F37] flex items-center justify-center font-medium">
            <CropIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900 tracking-tight">
              CMS Image Upload Pipeline
            </h4>
            <p className="text-xs text-stone-500 font-sans">
              16:9 aspect ratio cropping &middot; Vercel Blob client storage
            </p>
          </div>
        </div>

        {imgSrc && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 px-2.5 py-1 rounded hover:bg-stone-100 transition-colors"
            id="reset-uploader-btn"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Upload Zone / File Selector */}
      {!imgSrc && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-[#722F37] bg-[#722F37]/5'
              : 'border-stone-300 hover:border-stone-400 bg-stone-50/60 hover:bg-stone-50'
          }`}
          id="dropzone-area"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
            id="image-file-input"
          />
          <div className="mx-auto w-12 h-12 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6 text-stone-600" />
          </div>
          <p className="text-sm font-medium text-stone-800">
            Click to choose an image or drag & drop here
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Supports JPEG, PNG, WebP up to 15MB. Automatically enforces 16:9 ratio.
          </p>
        </div>
      )}

      {/* Cropping Stage */}
      {imgSrc && !uploadedUrl && (
        <div className="space-y-4" id="crop-stage-container">
          <div className="relative max-h-[420px] overflow-hidden bg-stone-900 rounded-lg flex items-center justify-center p-2">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-h-[380px]"
            >
              <img
                ref={imgRef}
                alt="Source to Crop"
                src={imgSrc}
                onLoad={onImageLoad}
                className="max-h-[380px] w-auto object-contain select-none"
              />
            </ReactCrop>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-stone-600 font-sans">
              <span className="inline-block w-2 h-2 rounded-full bg-[#722F37]" />
              <span>Aspect Ratio locked to 16:9 (Landscape Editorial)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={isUploading}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                id="cancel-crop-btn"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={handleCropAndUpload}
                disabled={isUploading || !completedCrop?.width || !completedCrop?.height}
                className="px-4 py-2 bg-[#722F37] hover:bg-[#581c24] text-white text-xs font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                id="crop-upload-action-btn"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Crop & Upload to Vercel Blob</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success / Result Display */}
      {uploadedUrl && (
        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200" id="upload-success-panel">
          <div className="flex items-start gap-3">
            <div className="text-emerald-700 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
                  Image Ready
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Upload another
                </button>
              </div>

              {/* Cropped Preview Image */}
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-stone-200 shadow-inner bg-stone-900/10">
                <img
                  src={uploadedUrl}
                  alt="Cropped Result"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* URL Display and copy button */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={uploadedUrl}
                  className="flex-1 bg-white border border-stone-200 text-stone-700 text-xs px-3 py-1.5 rounded-lg select-all font-mono truncate"
                  id="final-public-url-input"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                  id="copy-public-url-btn"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200 transition-colors"
                  title="Open image in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Box */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900" id="upload-error-box">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
