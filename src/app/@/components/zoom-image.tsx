import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog-zoom"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { 
  Maximize2
} from "lucide-react"

interface ZoomImageProps {
  image: string
}
export function ZoomImage({ image }: ZoomImageProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="absolute bottom-2 right-2 z-10 bg-black/50 p-2 rounded-full cursor-pointer hover:opacity-80">
          <Maximize2 size={24} color="white" />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="sr-only">Zoomed image</DialogTitle>
        <img
          src={image}
          className="w-full h-full object-cover"
          alt="Zoomed content"
        />
      </DialogContent>
    </Dialog>
  )
}
