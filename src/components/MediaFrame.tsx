import { useEffect, useState } from "react";

type MediaFrameProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  fit?: "cover" | "contain";
  aspectRatio?: number;
};

export function MediaFrame({
  src,
  alt,
  className = "",
  loading = "lazy",
  fit = "cover",
  aspectRatio,
}: MediaFrameProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div
      className={`media-frame media-frame--${fit}${loaded ? " media-frame--loaded" : ""} ${className}`.trim()}
      style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
    >
      {src ? (
        <>
          {!loaded ? <div aria-hidden="true" className="media-frame__skeleton" /> : null}
          <img alt={alt} loading={loading} src={src} onLoad={() => setLoaded(true)} />
        </>
      ) : (
        <div className="media-frame__skeleton" role="img" aria-label={`${alt} unavailable`}>
          <span>Media unavailable</span>
        </div>
      )}
    </div>
  );
}
