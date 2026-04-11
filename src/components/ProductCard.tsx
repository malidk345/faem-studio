import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  /**
   * Optional video URL for hover preview.
   * Medusa: map from product.media[] or a custom metadata field.
   * If omitted, only the image is shown.
   */
  videoUrl?: string;
  reviewCount?: number;
  rating?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  videoUrl,
  reviewCount = 0,
  rating = 4.8,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && isLoaded) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const showVideo = isHovered && isLoaded && !!videoUrl;

  return (
    <Link
      to={`/product/${product.id}`}
      className="block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'grid', padding: '0.5rem' }}
    >
      {/* ── Media ── */}
      <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>

        {/* Video — lazy loaded, plays on hover */}
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            preload="none"
            onLoadedData={() => setIsLoaded(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 6,
              filter: 'brightness(1.25)',
              display: showVideo ? 'block' : 'none',
            }}
          />
        )}

        {/* Image — fades out when video plays */}
        <img
          src={product.image}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 6,
            filter: 'brightness(1.15)',
            transition: 'opacity 0.5s',
            opacity: showVideo ? 0 : 1,
            mixBlendMode: showVideo ? 'lighten' : 'normal',
          }}
        />

        {/* Price badge — bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.25rem',
            left: '0.25rem',
            zIndex: 2,
            backgroundColor: '#FFFFFF',
            padding: '0.25rem 0.5rem',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            color: '#1A1A1A',
            lineHeight: 1,
          }}
        >
          {product.price}
        </div>
      </div>

      {/* ── Info ── */}
      <div
        style={{
          fontFamily: 'monospace',
          fontWeight: 300,
          display: 'grid',
          gap: '0.25rem',
          lineHeight: 1,
          color: 'color-mix(in lch, #1A1A1A, transparent 45%)',
          marginTop: '0.5rem',
        }}
      >
        {/* Rating row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Star
            size={16}
            style={{ color: 'hsl(30 80% 50%)', fill: 'hsl(30 80% 50%)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 12 }}>
            {rating} | {reviewCount > 0 ? `${reviewCount.toLocaleString()} Reviews` : 'New Arrival'}
          </span>
        </div>

        {/* Product name */}
        <h3
          style={{
            margin: 0,
            lineHeight: 1.4,
            color: '#1A1A1A',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          {product.name}
        </h3>

        {/* Category */}
        <p style={{ margin: 0, fontSize: 12 }}>
          {product.category}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
