"use client";

import Image from "next/image";
import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const heroImages = [
  { imgUrl: "/assets/images/hero-1.svg", alt: "Smart Watch" },
  { imgUrl: "/assets/images/hero-2.svg", alt: "bag" },
  { imgUrl: "/assets/images/hero-3.svg", alt: "Lamp" },
  { imgUrl: "/assets/images/hero-4.svg", alt: "Air fryer" },
  { imgUrl: "/assets/images/hero-5.svg", alt: "Chair" },
];

const HeroCarousel = () => {
  return (
    <div className="hero-carousel">
      <Carousel
        showThumbs={false}
        autoPlay
        infiniteLoop
        interval={2000}
        showArrows={false}
        showStatus={false}
      >
        {heroImages.map((image) => (
          <Image
            src={image.imgUrl}
            alt={image.alt}
            key={image.alt}
            width={484}
            height={484}
            className="object-contain"
          />
        ))}
      </Carousel>
      <Image
        className="max-xl:hidden absolute -left-[15%] bottom-0 z-0"
        src={"/assets/icons/hand-drawn-arrow.svg"}
        alt="arrow"
        height={175}
        width={175}
      />
    </div>
  );
};

export default HeroCarousel;
