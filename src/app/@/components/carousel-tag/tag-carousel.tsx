"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../carousel-tag/carousel";

interface TagCarouselProps {
  tags: { name: string; image: string }[];
  selectedTag: string | null;
  onSelect: (tag: string | null) => void;
}

export default function TagCarousel({ tags, selectedTag, onSelect }: TagCarouselProps) {
  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-2">
        {tags.map((tag) => (
          <CarouselItem key={tag.name} className="basis-auto pl-2">
            <div
              onClick={() => onSelect(tag.name === selectedTag ? null : tag.name)}
              className={`px-3 py-2 flex justify-center items-center gap-2 rounded-full border text-sm font-medium shadow-sm cursor-pointer transition-colors
                ${
                  tag.name === selectedTag
                    ? "bg-black text-white border-black"
                    : "bg-white text-black hover:bg-black hover:text-white border-gray-300"
                }`}
            >
              <img
                src={tag.image}
                alt={tag.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              {tag.name}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselPrevious /> */}
      {/* <CarouselNext /> */}
    </Carousel>
  );
}
