import Image from 'next/image';

interface ImageSlotProps {
  /** Omit src to render a labeled placeholder slot (no photography exists yet). */
  src?: string;
  alt: string;
  label: string;
  /** Responsive srcset for the raw <img> path (e.g. hero LCP image). When provided, bypasses next/image. */
  srcSet?: string;
  sizes?: string;
  /** Marks this image as high priority (LCP candidate): eager load + fetchpriority high. */
  priority?: boolean;
  /** 'contain' for diagrams (floor plans) — no crop, no washed filter. Default 'cover'. */
  fit?: 'cover' | 'contain';
}

export default function ImageSlot({ src, alt, label, srcSet, sizes, priority, fit = 'cover' }: ImageSlotProps) {
  if (!src) {
    return (
      <div className="img-slot" role="img" aria-label={alt}>
        {label}
      </div>
    );
  }
  if (srcSet) {
    return (
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className="img-cover washed"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        fetchPriority={priority ? 'high' : undefined}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={fit === 'contain' ? 'img-contain' : 'img-cover washed'}
      sizes="100vw"
      priority={priority}
    />
  );
}
