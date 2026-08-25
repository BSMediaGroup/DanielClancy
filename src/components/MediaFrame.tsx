import { useEffect, useState } from "react";

type MediaFrameProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  fit?: "cover" | "contain";
  aspectRatio?: number;
  preloaded?: boolean;
  sizes?: string;
  srcSet?: string;
};

export function MediaFrame({
  src,
  alt,
  className = "",
  loading = "lazy",
  fetchPriority = "auto",
  fit = "cover",
  aspectRatio,
  preloaded = false,
  sizes,
  srcSet = "",
}: MediaFrameProps) {
  const [loaded, setLoaded] = useState(preloaded);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(preloaded);
    setFailed(false);
  }, [preloaded, src, srcSet]);

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
            {...{ fetchpriority: fetchPriority }}
            loading={loading}
            sizes={srcSet ? sizes : undefined}
            src={src}
            srcSet={srcSet || undefined}
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
