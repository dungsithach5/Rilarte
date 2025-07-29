"use client"

import axios from "axios"
import React, { useState, useRef, useEffect } from "react"
import { UploadCloud, Crop } from "lucide-react"
import Cropper, { Area } from "react-easy-crop"
import { useAuth } from "../hooks/useAuth"
import TagInput from "../@/components/post-artwork/tag-input"

interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

export default function Post() {
  const { session } = useAuth(true)
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
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  const handleSubmit = async (e: HandleSubmitEvent) => {
    e.preventDefault()
    if (!imageFile) return alert("Vui lòng chọn một ảnh")

    try {
      const formData = new FormData()
      formData.append("image", imageFile)

      const uploadResponse = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      const imageUrl = uploadResponse.data.imageUrl

      const newPost = {
        user_name: session?.user?.email,
        title,
        content: description,
        image_url: imageUrl,
        tags
      }

      await axios.post("http://localhost:5000/api/posts", newPost)

      setTitle("")
      setDescription("")
      setImage(null)
      setImageFile(null)
      setTags([])
      if (inputFileRef.current) inputFileRef.current.value = ""
    } catch (err) {
      console.error("Error creating post:", err)
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
      <div className="px-90">
        <h2 className="text-xl font-bold mb-4 text-left">New post</h2>
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

            <button
              type="submit"
              disabled={!image}
              className="bg-black text-white py-2 px-4 rounded-lg hover:opacity-80 disabled:bg-gray-300"
            >
              Post
            </button>
          </div>
        </form>

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
