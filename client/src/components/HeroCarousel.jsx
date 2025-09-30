import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import hero1 from "../assets/hero-1.jpg";
import hero2 from "../assets/hero-2.jpg";
import hero3 from "../assets/hero-3.jpg";
import hero4 from "../assets/hero-4.jpg";
import hero5 from "../assets/hero-5.jpg";

const slides = [
  {
    id: 1,
    image: hero1,
    title: "Bộ sưu tập mới",
    subtitle: "Giày thể thao cao cấp",
    description: "Nâng tầm phong cách, tối ưu hiệu suất",
  },
  {
    id: 2,
    image: hero2,
    title: "Chạy như gió",
    subtitle: "Nike Running Collection",
    description: "Công nghệ tiên tiến cho runners",
  },
  {
    id: 3,
    image: hero3,
    title: "Bóng rổ đỉnh cao",
    subtitle: "Basketball Pro Series",
    description: "Thiết kế dành cho hiệu suất tối đa",
  },
  {
    id: 4,
    image: hero4,
    title: "Yoga & Fitness",
    subtitle: "Trang phục tập luyện",
    description: "Thoải mái, năng động mọi động tác",
  },
  {
    id: 5,
    image: hero5,
    title: "Sân cỏ là nhà",
    subtitle: "Soccer & Football Gear",
    description: "Chất lượng cho đam mê bóng đá",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-muted group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-in-out",
            index === currentSlide
              ? "opacity-100 translate-x-0"
              : index < currentSlide
              ? "opacity-0 -translate-x-full"
              : "opacity-0 translate-x-full"
          )}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-primary-foreground animate-fade-in">
                <p className="text-lg md:text-xl font-medium mb-2 text-secondary">
                  {slide.subtitle}
                </p>
                <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
                  {slide.description}
                </p>
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  Khám phá ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-3 rounded-full transition-all duration-300",
              index === currentSlide
                ? "w-12 bg-secondary"
                : "w-3 bg-background/50 hover:bg-background/80"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
