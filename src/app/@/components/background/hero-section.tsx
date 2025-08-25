import React from 'react';
import RotatingText from '../RotatingText/RotatingText';

export default function HeroSection() {
  return (
    <section className="w-full overflow-hidden flex justify-center items-center">
      <div className="flex flex-col px-6 justify-center items-center text-center">
        <h1 className="font-bold leading-tight text-2xl md:text-3xl lg:text-4xl flex flex-wrap items-center gap-2">
          Explore your{" "}
          <RotatingText
            texts={["creative", "vivid", "pure", "real", "fluid", "cool", "artsy"]}
            mainClassName="px-2 sm:px-2 md:px-5 bg-black text-white overflow-hidden py-0.5 sm:py-1 md:py-1 justify-center rounded-xl"
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2500}
          />
          energy
        </h1>
        <p className="text-sm md:text-xl text-gray-800 mt-4 max-w-2xl mx-auto">
          Discover new visuals, trending topics, and inspirations across the platform.
        </p>
      </div>
    </section>
  );
};
