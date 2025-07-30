import { useState } from "react"
import axios from "axios"

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base"
const HUGGINGFACE_API_TOKEN = process.env.HF_API_TOKEN

export function AiLogo({ imageUrl }: { imageUrl: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [show, setShow] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    setShow(true)
    setResult(null)

    try {
      const response = await axios.post(
        HUGGINGFACE_API_URL,
        { inputs: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      )

      const data = response.data
      setResult(data?.[0]?.generated_text || "Không có kết quả.")
    } catch (err) {
      console.error(err)
      setResult("Có lỗi xảy ra khi phân tích ảnh.")
    }

    setLoading(false)
  }

  return (
    <div className="absolute bottom-3 right-3 flex flex-col items-end z-10">
      <button
        onClick={handleAnalyze}
        className="bg-white rounded-full shadow-lg p-2 flex items-center gap-2 hover:bg-gray-100 transition"
        title="Phân tích ảnh bằng AI"
      >
        <img src="/img/ai-logo.png" alt="AI" className="w-8 h-8" />
      </button>

      {show && (
        <div className="mt-2 bg-white p-3 rounded-lg shadow-lg max-w-xs text-sm">
          {loading ? "Đang phân tích..." : result}
        </div>
      )}
    </div>
  )
}
