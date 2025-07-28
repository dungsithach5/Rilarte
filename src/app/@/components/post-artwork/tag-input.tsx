"use client"

import React, { useState, useEffect } from "react"

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
  disabled?: boolean
}

export default function TagInput({ tags, setTags, disabled = false }: TagInputProps) {
  const [tagInput, setTagInput] = useState("")

  const handleAddTag = (value: string) => {
    const newTag = value.trim().replace(/^#/, "")
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault()
      handleAddTag(tagInput)
      setTagInput("")
    }
    if (e.key === "Backspace" && tagInput === "") {
      setTags(tags.slice(0, -1))
    }
  }

  return (
    <div className={`flex flex-wrap gap-2 border p-2 rounded-lg min-h-[60px] ${disabled ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}>
      {tags.map((tag, i) => (
        <div
          key={i}
          className="bg-black text-white font-semibold px-2 py-1 rounded-lg text-sm flex items-center gap-1"
        >
          #{tag}
          <button
            onClick={() => setTags(tags.filter((_, j) => j !== i))}
            className="text-white text-xs ml-1"
            type="button"
            disabled={disabled}
          >
            ×
          </button>
        </div>
      ))}
      <input
        type="text"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter"
        className="flex-1 min-w-[120px] bg-transparent outline-none"
        disabled={disabled}
      />
    </div>
  )
}
