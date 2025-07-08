import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Ellipsis, Download } from "lucide-react"

interface DropdownMenuEllipsisProps {
  imageUrl: string;
  fileName?: string;
  onOpenChange?: (open: boolean) => void;
}

export default function DropdownMenuEllipsis ({
  imageUrl,
  fileName = "downloaded.jpg",
  onOpenChange,
}: DropdownMenuEllipsisProps) {
  const handleDownload = async () => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Ellipsis 
          size={24} 
          color="white" 
          className="absolute top-3 right-3 cursor-pointer h-6 w-6 hover:bg-black/35 rounded-full" 
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
          <Download size={18} color="black"/>
          Download
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
