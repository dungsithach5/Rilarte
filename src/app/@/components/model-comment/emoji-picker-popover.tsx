"use client"

import { useState } from "react"
import EmojiPicker from "emoji-picker-react"
import { Smile } from "lucide-react"

type EmojiPickerPopoverProps = {
  onSelect: (emojiData: any) => void
}

export default function EmojiPickerPopover({ onSelect }: EmojiPickerPopoverProps) {
  const [showPicker, setShowPicker] = useState(false)

  const handleEmojiClick = (emojiData: any) => {
    onSelect(emojiData)
    setShowPicker(false)
  }

  return (
    <div className="absolute left-3 top-2 z-10">
      <Smile
        className="text-gray-400 cursor-pointer w-5 h-5"
        onClick={() => setShowPicker((prev) => !prev)}
      />
      {showPicker && (
        <div className="absolute top-6 left-0 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  )
}
