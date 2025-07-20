"use client"
import { useState } from "react"
import { Bot, Loader2 } from "lucide-react"
import ColorThief from "colorthief"

export function AILogo({ imageUrl }: { imageUrl: string }) {
  const [loading, setLoading] = useState(false)
  const [colors, setColors] = useState<number[][]>([])

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = imageUrl

      img.onload = () => {
        const colorThief = new ColorThief()
        const palette = colorThief.getPalette(img, 10)
        setColors(palette)
        setLoading(false)
      }

      img.onerror = () => {
        alert("🚫 Failed to load image for color analysis.")
        setLoading(false)
      }
    } catch (err) {
      console.error("Error analyzing image:", err)
      setLoading(false)
    }
  }

  return (
    <div className="absolute bottom-4 right-14 z-20 flex flex-col items-end gap-2">
      <button
        onClick={handleAnalyze}
        className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
        title="Analyze with AI"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        ) : (
          <Bot className="w-5 h-5 text-black" />
        )}
      </button>

      {/* Hiển thị các màu */}
      {colors.length > 0 && (
        <div className="flex gap-1 p-1 bg-white rounded shadow">
          {colors.map((color, index) => (
            <div
              key={index}
              className="w-5 h-5 rounded"
              style={{ backgroundColor: `rgb(${color.join(",")})` }}
              title={`rgb(${color.join(",")})`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
