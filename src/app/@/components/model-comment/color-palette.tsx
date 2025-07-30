"use client"

import { useEffect, useRef, useState } from "react"
import ColorThief from "colorthief"

type ColorPaletteProps = {
  imageUrl: string
}

export default function ColorPalette({ imageUrl }: ColorPaletteProps) {
  const [palette, setPalette] = useState<number[][]>([])
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const img = imgRef.current

    if (img.complete) {
      extractColors()
    } else {
      img.onload = () => {
        extractColors()
      }
    }

    function extractColors() {
      try {
        const colorThief = new ColorThief()
        const colors = colorThief.getPalette(img, 7)
        setPalette(colors)
      } catch (error) {
        console.error("ColorThief error:", error)
      }
    }
  }, [imageUrl])

  return (
    <>
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Color palette preview"
        crossOrigin="anonymous"
        className="hidden"
      />
      <div className="flex gap-1">
        {palette.map((color, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-300 w-8 h-8"
            style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
            title={`rgb(${color[0]}, ${color[1]}, ${color[2]})`}
          />
        ))}
      </div>
    </>
  )
}
