// Next.js 15 Optimized Image Component
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  // Default sizes for responsive images
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      sizes={fill ? defaultSizes : undefined}
      className={cn('object-cover', className)}
      {...props}
    />
  );
}

// Example usage components for common patterns
export function HeroImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority
      quality={90}
      className={cn('object-cover', className)}
      sizes="100vw"
    />
  );
}

export function ProfileImage({ 
  src, 
  alt, 
  size = 40,
  className 
}: { 
  src: string; 
  alt: string; 
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      quality={80}
    />
  );
}

export function VehicleImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string; 
  alt: string; 
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={300}
      className={cn('rounded-lg', className)}
      quality={85}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
    />
  );
}
