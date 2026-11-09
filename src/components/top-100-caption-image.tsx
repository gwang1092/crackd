type Top100CaptionImageProps = {
  src: string;
  srcSet?: string;
  captionId: string;
};

const RESPONSIVE_SIZES =
  "(max-width: 640px) 320px, (max-width: 768px) 320px, 320px";

export function Top100CaptionImage({
  src,
  srcSet,
  captionId,
}: Top100CaptionImageProps) {
  // No backdrop of its own: any space around a meme shows the card's background.
  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={src}
        srcSet={srcSet}
        sizes={RESPONSIVE_SIZES}
        alt={`Caption Image ${captionId}`}
        className="absolute inset-0 h-full w-full object-contain"
        loading="lazy"
      />
    </div>
  );
}
