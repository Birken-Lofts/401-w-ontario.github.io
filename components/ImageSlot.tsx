import Image from 'next/image';

interface ImageSlotProps {
  /** Omit src to render a labeled placeholder slot (no photography exists yet). */
  src?: string;
  alt: string;
  label: string;
}

export default function ImageSlot({ src, alt, label }: ImageSlotProps) {
  if (!src) {
    return (
      <div className="img-slot" role="img" aria-label={alt}>
        {label}
      </div>
    );
  }
  return <Image src={src} alt={alt} fill className="img-cover washed" sizes="100vw" />;
}
