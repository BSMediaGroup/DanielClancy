import { useEffect, useState } from "react";

type MediaFrameProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

export function MediaFrame({
  src,
  alt,
  className = "",
  loading = "lazy",
}: MediaFrameProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className={`media-frame${loaded ? " media-frame--loaded" : ""} ${className}`.trim()}>
      {!loaded ? <div aria-hidden="true" className="media-frame__skeleton" /> : null}
      <img alt={alt} loading={loading} src={src} onLoad={() => setLoaded(true)} />
    </div>
  );
}
