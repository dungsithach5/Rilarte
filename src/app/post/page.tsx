"use client"

import axios from 'axios'
import React, { useState, useRef, useEffect } from "react"
import { UploadCloud, Crop } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import { useAuth } from "../hooks/useAuth";

interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

export default function Post() {
  const { session } = useAuth(true);
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const handleImageChange = (file: File | null) => {
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Ảnh vượt quá 20MB. Vui lòng chọn ảnh nhỏ hơn.");
        return;
      }
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleImageChange(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isEntering);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleImageChange(file);
    e.dataTransfer.clearData();
  };

  const handleSubmit = async (e: HandleSubmitEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Vui lòng chọn một ảnh');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadResponse = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = uploadResponse.data.imageUrl;

      const newPost = {
        user_name: session?.user?.email,
        title,
        content: description,
        image_url: imageUrl
      };

      await axios.post('http://localhost:5000/api/posts', newPost, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      setTitle('');
      setDescription('');
      setImage(null);
      setImageFile(null);
      if (inputFileRef.current) inputFileRef.current.value = '';
      console.log('Data to send:', newPost);
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const getCroppedImg = async (imageSrc: string, cropPixels: Area): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context is null');
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Canvas is empty'));
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }, 'image/jpeg');
    });
  };

  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = e => reject(e);
      img.src = url;
    });
  }

  return (
    <section className="w-full">
      <div className="px-90">
        <h2 className="text-xl font-bold mb-4 text-left">New post</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div
            className={`w-full h-[700px] bg-gray-200 hover:bg-gray-200 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer
            ${isDragging ? "bg-pink-100 border-4 border-dashed border-pink-400" : ""}`}
            onClick={() => inputFileRef.current?.click()}
            onDragEnter={e => handleDrag(e, true)}
            onDragLeave={e => handleDrag(e, false)}
            onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "copy";
              setIsDragging(true);
            }}
            onDrop={handleDrop}
          >
            {isMounted && image ? (
              <img src={image} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center mt-4">
                  <UploadCloud className="h-10 w-10 text-gray-500 mb-1" />
                  <span className="text-lg text-gray-500 font-medium">Or drag & drop your image here</span>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500 block">Please upload an image file (maximum 20MB)</span>
                  <span className="text-sm text-gray-500 block mb-3">Supported formats: JPG, PNG, WebP, etc.</span>
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={inputFileRef}
              onChange={onFileChange}
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
              <input
                id="title"
                type="text"
                placeholder="Write a title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="border p-3 py-6 rounded-lg focus:outline-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={!image}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                placeholder="Write a Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="border p-2 rounded-lg h-24 resize-none focus:outline-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!image}
              />
              {image && (
                <button
                  type="button"
                  className="text-black p-2 rounded-lg w-fit self-start cursor-pointer border hover:bg-gray-200"
                  title="Cắt ảnh"
                  onClick={() => setIsCropOpen(true)}
                >
                  <Crop className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="bg-black hover:opacity-50 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!image}
            >
              Post
            </button>
          </div>
        </form>

        {isCropOpen && image && (
          <div className="fixed inset-0 flex items-center justify-center pb-12">
            <div className="w-[90vw] h-[90vh] rounded-xl overflow-hidden flex flex-col items-center justify-center">
              <div className="relative w-[80vw] h-[80vh] bg-zinc-900">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, area) => setCroppedAreaPixels(area)}
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button className="bg-gray-300 px-4 py-2 rounded-lg" onClick={() => setIsCropOpen(false)}>Cancel</button>
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer"
                  onClick={async () => {
                    if (image && croppedAreaPixels) {
                      const cropped = await getCroppedImg(image, croppedAreaPixels);
                      setImage(cropped);
                      const response = await fetch(cropped);
                      const blob = await response.blob();
                      const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
                      setImageFile(croppedFile);
                    }
                    setIsCropOpen(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
