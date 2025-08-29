import React from 'react';
import Masonry from 'react-masonry-css';
import RotatingText from '../RotatingText/RotatingText';

interface HeroSectionProps {
  title: string
  description: string
}

export default function HeroSection({ title, description }: HeroSectionProps) {
  const breakpointColumnsObj = {
    default: 3, 
    768: 2, 
    480: 1     
  };

  const images = [
    { id: 2, src: "/img/hero3.png", alt: "Image 2" },
    { id: 1, src: "/img/hero2.png", alt: "Image 1" },
    { id: 6, src: "/img/hero1.png", alt: "Image 6" },
    { id: 4, src: "/img/hero4.png", alt: "Image 4" },
    { id: 3, src: "/img/slide1.png", alt: "Image 3" },
    { id: 5, src: "/img/slide2.png", alt: "Image 5" },
  ];

  return (
    <div className="flex justify-center items-center max-h-[80vh] p-4 mt-20">
      <div className="w-full max-w-7xl flex flex-col justify-start">
        <div className="flex flex-col md:flex-row flex-grow justify-between items-stretch h-full">
          <div className="flex flex-col items-start justify-center text-left max-w-xl md:pr-8 mb-8 md:mb-0">
            <h1 className="font-bold leading-tight text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4">
              {title}
            </h1>
            <p className="text-gray-600 text-base md:text-lg mb-6">
              {description}
            </p>
            <div className="flex space-x-4">
              <button className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition duration-300">
                Create Now
              </button>
            </div>
          </div>

          <div className="flex-1 h-full flex flex-col justify-between"> 
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex w-auto ml-16 h-full"
              columnClassName="pl-4 bg-clip-padding"
            >
              {images.map(image => (
                <div key={image.id} className="mb-2">
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-auto object-cover rounded-xl" 
                  />
                </div>
              ))}
            </Masonry>
          </div>
        </div>
      </div>
    </div>
  );
}