"use client"

import axios from "axios"
import React, { useState, useRef, useEffect } from "react"
import toast, { Toaster } from 'react-hot-toast'
import { UploadCloud, Crop, Shield } from "lucide-react"
import Cropper, { Area } from "react-easy-crop"
import { useAuth } from "../hooks/useAuth"
import TagInput from "../@/components/post-artwork/tag-input"
import ImageUploadForm from "../@/components/copyright/ImageUploadForm"

interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

export default function Post() {
  const { user, session, isAuthenticated } = useAuth(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCropOpen, setIsCropOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [showCopyrightForm, setShowCopyrightForm] = useState(false)
  const [copyrightSettings, setCopyrightSettings] = useState({
    license_type: '',
    watermark_enabled: false,
    watermark_text: '',
    watermark_position: 'bottom-right',
    download_protected: false,
    allow_download: false
  })
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [user, session, isAuthenticated])

  const handleImageChange = (file: File | null) => {
    if (file && file.size <= 20 * 1024 * 1024) {
      setImageFile(file)
      setImage(URL.createObjectURL(file))
    } else if (file) {
      alert("Ảnh vượt quá 20MB. Vui lòng chọn ảnh nhỏ hơn.")
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0] ?? null
    handleImageChange(file)
    e.dataTransfer.clearData()
  }

  const handleCopyrightSubmit = async (formData: FormData) => {
    // Cập nhật copyright settings từ form
    setCopyrightSettings({
      license_type: formData.get('license_type') as string,
      watermark_enabled: formData.get('watermark_enabled') === 'true',
      watermark_text: formData.get('watermark_text') as string,
      watermark_position: formData.get('watermark_position') as string,
      download_protected: formData.get('download_protected') === 'true',
      allow_download: formData.get('allow_download') === 'true'
    })
    setShowCopyrightForm(false)
  }

  const handleSubmit = async (e: HandleSubmitEvent) => {
    e.preventDefault()
    if (!imageFile) return alert("Vui lòng chọn một ảnh")
    
    // Lấy email từ user hoặc session
    const userEmail = user?.email || session?.user?.email
    if (!userEmail) {
      alert("Bạn cần đăng nhập để tạo post")
      return
    }

    try {
      let imageUrl = ""
      // Nếu có watermark, upload với watermark
      if (copyrightSettings.watermark_enabled) {
        const formData = new FormData()
        formData.append("image", imageFile)
        formData.append("watermark_enabled", "true")
        formData.append("watermark_text", copyrightSettings.watermark_text)
        formData.append("watermark_position", copyrightSettings.watermark_position)
        
        const uploadResponse = await axios.post("http://localhost:5001/api/upload/with-watermark", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        imageUrl = uploadResponse.data.imageUrl
      } else {
        // Upload bình thường
        const formData = new FormData()
        formData.append("image", imageFile)
        const uploadResponse = await axios.post("http://localhost:5001/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        imageUrl = uploadResponse.data.imageUrl
      }

      const newPost = {
        user_id: typeof user === 'number' ? user : 1,
        user_name: session?.user?.email || user?.email || user,
        title,
        content: description,
        image_url: imageUrl,
        tags,
        // Thêm copyright settings
        license_type: copyrightSettings.license_type,
        license_description: `License: ${copyrightSettings.license_type}`,
        watermark_enabled: copyrightSettings.watermark_enabled,
        watermark_text: copyrightSettings.watermark_text,
        watermark_position: copyrightSettings.watermark_position,
        download_protected: copyrightSettings.download_protected,
        allow_download: copyrightSettings.allow_download,
        copyright_owner_id: typeof user === 'number' ? user : 1,
        copyright_year: new Date().getFullYear()
      }

      console.log('Creating post with data:', newPost);

      await axios.post("http://localhost:5001/api/posts", newPost)
      toast.success("Post created successfully!")
      setTitle("")
      setDescription("")
      setImage(null)
      setImageFile(null)
      setTags([])
      setCopyrightSettings({
        license_type: '',
        watermark_enabled: false,
        watermark_text: '',
        watermark_position: 'bottom-right',
        download_protected: false,
        allow_download: false
      })
      if (inputFileRef.current) inputFileRef.current.value = ""
    } catch (err: any) {
      console.error("Error creating post:", err)
      if (err.response?.data?.message) {
        toast.error("Lỗi: " + err.response.data.message)
      } else {
        toast.error("Faild to create post. Please try again.")
      }
    }
  }

  const getCroppedImg = async (imageSrc: string, cropPixels: Area): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    canvas.width = cropPixels.width
    canvas.height = cropPixels.height
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context is null")

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
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error("Canvas is empty"))
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      }, "image/jpeg")
    })
  }

  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = e => reject(e)
      img.src = url
    })
  }

  return (
    <section className="w-full">
      <div className="px-90 mt-28">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Image Upload */}
          <div
            className={`w-full h-[700px] bg-gray-200 rounded-xl flex items-center justify-center text-center cursor-pointer 
            ${isDragging ? "bg-pink-100 border-4 border-dashed border-pink-400" : ""}`}
            onClick={() => inputFileRef.current?.click()}
            onDragEnter={e => (e.preventDefault(), setIsDragging(true))}
            onDragOver={e => e.preventDefault()}
            onDragLeave={e => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {isMounted && image ? (
              <img src={image} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="space-y-4">
                <UploadCloud className="h-10 w-10 text-gray-500 mx-auto" />
                <p className="text-sm text-gray-500">Click hoặc kéo ảnh vào đây (max 20MB)</p>
              </div>
            )}
            <input type="file" ref={inputFileRef} onChange={e => handleImageChange(e.target.files?.[0] ?? null)} className="hidden" />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={!image}
                placeholder="Write a title"
                className="w-full p-3 rounded-lg border disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={!image}
                placeholder="Write a description"
                className="w-full p-2 h-24 rounded-lg border resize-none disabled:bg-gray-100"
              />
              {image && (
                <button
                  type="button"
                  className="mt-2 text-black p-2 rounded-lg border hover:bg-gray-200"
                  onClick={() => setIsCropOpen(true)}
                >
                  <Crop className="w-5 h-5 inline" /> Cut
                </button>
              )}
            </div>

            <div>
              <label className="text-sm">Tags</label>
              <TagInput tags={tags} setTags={setTags} disabled={!image}/>
              <small className="text-gray-400 text-xs">Use Enter or comma to separate tags</small>
            </div>

            {/* Copyright Settings Button */}
            {image && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowCopyrightForm(true)}
                  className="w-full p-3 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Copyright Protection Settings
                </button>
                {copyrightSettings.license_type && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    ✓ License: {copyrightSettings.license_type}
                    {copyrightSettings.watermark_enabled && " | Watermark enabled"}
                    {copyrightSettings.download_protected && " | Download protected"}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!image}
              className="bg-black text-white py-2 px-4 rounded-lg hover:opacity-80 disabled:bg-gray-300"
            >
              Post
            </button>
          </div>
        </form>

        {/* Copyright Form Modal */}
        {showCopyrightForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Copyright Protection Settings</h3>
                <button
                  onClick={() => setShowCopyrightForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <ImageUploadForm onSubmit={handleCopyrightSubmit} previewUrl={image || undefined}/>
            </div>
          </div>
        )}

        {/* Crop Modal */}
        {isCropOpen && image && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="w-[90vw] h-[90vh] bg-white rounded-xl p-4 flex flex-col items-center">
              <div className="relative w-full h-full bg-zinc-900 rounded-lg overflow-hidden">
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
                <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={() => setIsCropOpen(false)}>Cancel</button>
                <button
                  className="px-4 py-2 rounded-lg bg-black text-white"
                  onClick={async () => {
                    if (image && croppedAreaPixels) {
                      const cropped = await getCroppedImg(image, croppedAreaPixels)
                      setImage(cropped)
                      const blob = await (await fetch(cropped)).blob()
                      const croppedFile = new File([blob], "cropped-image.jpg", { type: "image/jpeg" })
                      setImageFile(croppedFile)
                    }
                    setIsCropOpen(false)
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
