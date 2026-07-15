interface StaticImgProps {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'auto';
}

/** Plain <img> with a hand-rolled srcset — next/image emits none under `images.unoptimized`. */
export default function StaticImg({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  fetchPriority,
}: StaticImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
    />
  );
}
