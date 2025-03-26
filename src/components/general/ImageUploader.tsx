"use client";
import { ImageKitProvider, IKUpload } from "imagekitio-next";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { useState } from "react";

const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

const authenticator = async () => {
  try {
    const response = await fetch("/api/auth");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error) {
    throw new Error(`Authentication request failed: ${error}`);
  }
};

const validateFile = (file: File) => {
  const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
  const maxFileSize = 5 * 1024 * 1024; // 5 MB

  if (!validImageTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed.");
  }

  if (file.size > maxFileSize) {
    throw new Error("File size exceeds the 5 MB limit.");
  }

  return true;
};

export default function ImageUploader({
  onUploadSuccess,
}: {
  onUploadSuccess: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const onError = (err: { message: string }) => {
    setError(err.message);
    setUploading(false);
    setProgress(0);
    console.log("Image upload error:", err);
  };

  const onSuccess = (res: IKUploadResponse) => {
    setUploading(false);
    setError(null);
    setProgress(100);
    console.log("Success", res.url);
    onUploadSuccess(res.url);
  };

  const onUploadStart = () => {
    setUploading(true);
    setError(null);
    setProgress(0);
  };

  const onProgress = (progressEvent: ProgressEvent) => {
    const progress = Math.round(
      (progressEvent.loaded / progressEvent.total) * 100
    );
    setProgress(progress);
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <div>
        <IKUpload
          name="coverImage"
          fileName="image"
          accept="image/*"
          validateFile={validateFile}
          onError={onError}
          onSuccess={onSuccess}
          onUploadStart={onUploadStart}
          onUploadProgress={onProgress}
          useUniqueFileName={true}
          folder="/buzzify"
          disabled={uploading} // Disable the button during upload
        />
      </div>
      
      {uploading && (
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-700 mt-2">{progress}%</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </ImageKitProvider>
  );
}
