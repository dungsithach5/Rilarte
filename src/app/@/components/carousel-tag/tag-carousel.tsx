"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface TagCarouselProps {
  tags: string[];
  selectedTag: string | null;
  onSelect: (tag: string | null) => void;
}

export default function TagCarousel({ tags, selectedTag, onSelect }: TagCarouselProps) {
  return (
    <Carousel className="w-full max-w-5xl">
      <CarouselContent className="-ml-2">
        {tags.map((tag) => (
          <CarouselItem key={tag} className="basis-auto pl-2">
            <div
              onClick={() => onSelect(tag === selectedTag ? null : tag)}
              className={`px-3 py-2 flex justify-center items-center gap-2 rounded-full border text-sm font-medium shadow-sm cursor-pointer transition-colors
                ${
                  tag === selectedTag
                    ? "bg-black text-white border-black"
                    : "bg-white text-black hover:bg-black hover:text-white border-gray-300"
                }`}
            >
              <img
                src="https://images.unsplash.com/photo-1755845711249-32cfcdcabfeb?w=500&auto=format&fit=crop&q=60"
                alt=""
                className="w-6 h-6 rounded-full"
              />
              {tag}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
