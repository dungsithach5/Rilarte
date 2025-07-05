"use client"
import React, { useState, useRef } from "react"
import { UploadCloud } from 'lucide-react';

interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {}
interface DragEvent extends React.DragEvent<HTMLDivElement> {}
interface DragEnterEvent extends React.DragEvent<HTMLDivElement> {}
interface DragLeaveEvent extends React.DragEvent<HTMLDivElement> {}
interface DropEvent extends React.DragEvent<HTMLDivElement> {}
interface DragOverEvent extends React.DragEvent<HTMLDivElement> {}

interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}
interface NewPost {
  title: string;
  description: string;
  link: string;
  image: string | null;
}

interface ImageFile extends File {}
interface HandleImageChange {
  (file: ImageFile | null): void;
}
export default function Post() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const inputFileRef = useRef<HTMLInputElement>(null)



  const handleImageChange: HandleImageChange = (file) => {
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Ảnh vượt quá 20MB. Vui lòng chọn ảnh nhỏ hơn.");
        return;
      }
      setImage(URL.createObjectURL(file));
    }
  };

  const onFileChange = (e: FileChangeEvent) => {
    const file = e.target.files && e.target.files[0];
    handleImageChange(file);
  };

  const handleDragEnter = (e: DragEnterEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragLeaveEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragOverEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDrop = (e: DropEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageChange(files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault()
    const newPost: NewPost = { title, description, link, image }
    console.log("Post Created:", newPost)
    // TODO: Gửi dữ liệu đến server (API)
  }

  return (
    <section className="w-full">
      <div className="px-90">
        <h2 className="text-xl font-bold mb-4 text-left">New post</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >
          {/* Image Preview Container */}
          <div
            className={`w-full h-[700px] bg-gray-200 hover:bg-gray-200 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer 
              ${isDragging ? "bg-pink-100 border-4 border-dashed border-pink-400" : ""}`}
            onClick={() => inputFileRef.current && inputFileRef.current.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {image ? (
              <img
                src={image}
                alt="Preview"
                className="h-full w-full object-cover"
              />
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

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={inputFileRef}
              onChange={onFileChange}
              className="hidden"
            />
          </div>

          {/* Form Fields (always shown, inputs disabled if no image) */}
          <div className="flex flex-col gap-4">
            {/* Title Input */}
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
              <input
                id="title"
                type="text"
                placeholder="Write a title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-3 py-6 rounded-lg focus:outline-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={!image}
              />
            </div>

            {/* Description Textarea */}
            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                placeholder="Write a Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 rounded-lg h-24 resize-none focus:outline-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!image}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-black hover:opacity-50 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!image}
            >
              Post
            </button>
          </div>


        </form>
      </div>
    </section>
  )
}
