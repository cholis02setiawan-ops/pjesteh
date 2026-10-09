"use client";
import { useState } from "react";
import { isImageSrc } from "./image";

// Renders product image from data URL / https URL, falls back to emoji when missing or broken
export function ProductImage({
  src, emoji, alt, className = "", rounded = "rounded-xl",
}: {
  src?: string | null;
  emoji?: string | null;
  alt: string;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = isImageSrc(src) && !failed;

  if (!showImage) {
    return (
      <div className={`${rounded} bg-gradient-to-br from-amber-50 to-teal-50 flex items-center justify-center ${className}`}>
        <span className="text-3xl leading-none">{emoji || "🥤"}</span>
      </div>
    );
  }

  return (
    <div className={`${rounded} bg-stone-100 overflow-hidden flex items-center justify-center ${className}`}>
      {/* plain img: data URLs and arbitrary hosts are not allowed by next/image remotePatterns */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src as string}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}