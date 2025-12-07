import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/carousel.css";

export default function ProductImageCarousel({
  images = [],
  selectedVariant = null,
}) {
  // Kiểm tra nếu images rỗng hoặc không phải mảng
  if (!Array.isArray(images) || images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-gray-200 rounded-lg">
        <p className="text-gray-500">Không có ảnh</p>
      </div>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const sliderRef = useRef(null);
  const thumbnailsContainerRef = useRef(null);
  const dragStartRef = useRef(0);

  // Tạo mảng clone với slide đầu và cuối để loop
  const clonedImages = [images[images.length - 1], ...images, images[0]];

  // Khi chuyển sang clone slide (đầu hoặc cuối), reset vị trí không có animation
  useEffect(() => {
    if (!sliderRef.current) return;

    // Nếu đang ở slide clone cuối cùng, nhảy về slide đầu tiên
    if (currentIndex === images.length + 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1);
      }, 400); // Chờ animation kết thúc rồi reset
    }

    // Nếu đang ở slide clone đầu tiên, nhảy về slide cuối cùng
    if (currentIndex === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(images.length);
      }, 400);
    }
  }, [currentIndex, images.length]);

  // Khi selectedVariant thay đổi, scroll tới ảnh đầu tiên của variant
  useEffect(() => {
    if (selectedVariant?.imageUrls && selectedVariant.imageUrls.length > 0) {
      const variantImageUrl = selectedVariant.imageUrls[0];
      const imageIndex = images.indexOf(variantImageUrl);

      if (imageIndex !== -1) {
        // +1 vì có clone slide ở đầu
        setIsTransitioning(true);
        setCurrentIndex(imageIndex + 1);

        // Scroll thumbnail container để hiển thị ảnh hiện tại
        if (thumbnailsContainerRef.current) {
          setTimeout(() => {
            const thumbnailButtons =
              thumbnailsContainerRef.current.querySelectorAll("button");
            if (thumbnailButtons[imageIndex]) {
              const thumbnail = thumbnailButtons[imageIndex];
              thumbnail.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
              });
            }
          }, 50);
        }
      }
    }
  }, [selectedVariant]);

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
    // Tính real index đích (bỏ clone)
    const targetRealIndex =
      index === 0
        ? images.length - 1
        : index === images.length + 1
        ? 0
        : index - 1;

    // Cuộn thumbnail tương ứng vào giữa (nếu có)
    if (thumbnailsContainerRef.current) {
      setTimeout(() => {
        const thumbnailButtons =
          thumbnailsContainerRef.current.querySelectorAll("button");
        const thumb = thumbnailButtons[targetRealIndex];
        if (thumb) {
          try {
            thumb.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center",
            });
          } catch (e) {
            // fallback
            thumbnailsContainerRef.current.scrollLeft =
              thumb.offsetLeft -
              thumbnailsContainerRef.current.clientWidth / 2 +
              thumb.clientWidth / 2;
          }
        }
      }, 80);
    }
  };

  const goToPrev = () => {
    goToSlide(currentIndex - 1);
  };

  const goToNext = () => {
    goToSlide(currentIndex + 1);
  };

  // Xử lý drag/swipe trên ảnh chính
  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    dragStartRef.current = clientX;
  };

  const handleDragEnd = (e) => {
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const startX = dragStartRef.current;
    const swipeThreshold = 20;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Kéo sang trái → ảnh tiếp theo
        goToNext();
      } else {
        // Kéo sang phải → ảnh trước
        goToPrev();
      }
    }
  };

  // Lấy index ảnh thực (bỏ qua clone)
  const realIndex =
    currentIndex === 0
      ? images.length - 1
      : currentIndex === images.length + 1
      ? 0
      : currentIndex - 1;

  return (
    <div className="w-full">
      {/* Main Slider Container */}
      <div className="relative w-full bg-white rounded-lg overflow-hidden mb-4">
        {/* Slides Wrapper */}
        <div
          className="relative w-full aspect-square overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          <div
            ref={sliderRef}
            className="carousel-slider"
            style={{
              transform: `translate3d(calc(-${currentIndex} * 100%), 0, 0)`,
              transition: isTransitioning ? "transform 400ms ease" : "none",
            }}
          >
            {clonedImages.map((img, idx) => (
              <div key={idx} className="carousel-slide">
                <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
                  {/* Ảnh gốc - không có zoom overlay */}
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Slide ${idx}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Số thứ tự ảnh */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded text-sm font-medium">
          {realIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails + Navigation Buttons */}
      <div className="relative">
        {/* Navigation Button - Prev (Overlay on left inside thumbnails) */}
        <button
          onClick={goToPrev}
          className="carousel-nav-btn-overlay carousel-nav-btn-overlay-prev"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="w-4 h-8 text-white" />
        </button>

        {/* Thumbnails Row */}
        <div
          ref={thumbnailsContainerRef}
          className="thumbnails-wrapper flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide"
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx + 1)} // +1 vì clone đầu tiên
              className={`thumb flex-shrink-0 rounded border-2 transition overflow-hidden ${
                realIndex === idx
                  ? "border-[#2B6377]"
                  : "border-gray-300 hover:border-[#2B6377]"
              }`}
            >
              <img
                src={img || "/placeholder.svg"}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Navigation Button - Next (Overlay on right) */}
        <button
          onClick={goToNext}
          className="carousel-nav-btn-overlay carousel-nav-btn-overlay-next"
          aria-label="Ảnh tiếp theo"
        >
          <ChevronRight className="w-4 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}
