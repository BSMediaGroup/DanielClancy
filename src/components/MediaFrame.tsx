import { useEffect, useState } from "react";

type MediaFrameProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  fit?: "cover" | "contain";
  aspectRatio?: number;
};

export function MediaFrame({
  src,
  alt,
  className = "",
  loading = "lazy",
  fetchPriority = "auto",
  fit = "cover",
  aspectRatio,
}: MediaFrameProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  return (
    <div
      className={`media-frame media-frame--${fit}${loaded ? " media-frame--loaded" : ""} ${className}`.trim()}
      style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
    >
      {src && !failed ? (
        <>
          {!loaded ? <div aria-hidden="true" className="media-frame__skeleton" /> : null}
          <img
            alt={alt}
            decoding="async"
            fetchPriority={fetchPriority}
            loading={loading}
            src={src}
            onError={() => setFailed(true)}
            onLoad={() => setLoaded(true)}
          />
        </>
      ) : (
        <div className="media-frame__skeleton" role="img" aria-label={`${alt} unavailable`}>
          <span>Media unavailable</span>
        </div>
      )}
    </div>
  );
}
