import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MediaFrame } from "./MediaFrame";
import type { PortfolioMediaItem } from "../content/siteContent";

type PortfolioMediaGalleryProps = {
  projectTitle: string;
  media: PortfolioMediaItem[];
  primaryImage?: string;
  galleryPaths?: string[];
  documentUrl?: string;
  documentationUrl?: string;
  documentationAvailable?: boolean;
  documentationStatusNote?: string;
};

export function PortfolioMediaGallery({
  projectTitle,
  media,
  primaryImage,
  galleryPaths = [],
  documentUrl,
  documentationUrl,
}: PortfolioMediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const dialogTitleId = useId();

  const resolvedMedia = galleryPaths.length
    ? galleryPaths.map((path, index) => ({
        id: `${projectTitle}-${index}`,
        index,
        fileName: path.split("/").pop() || "",
        src: path,
        alt: projectTitle,
        title: `${projectTitle} ${index + 1}`,
        description: "",
        aspectRatio: Math.SQRT2,
      }))
    : media;
  const primaryMedia =
    primaryImage && !resolvedMedia.some((item) => item.src === primaryImage)
      ? {
          id: `${projectTitle}-hero`,
          index: 0,
          fileName: primaryImage.split("/").pop() || "",
          src: primaryImage,
          alt: projectTitle,
          title: projectTitle,
          description: "",
          aspectRatio: Math.SQRT2,
        }
      : null;
  const displayMedia = primaryMedia ? [primaryMedia, ...resolvedMedia] : resolvedMedia;
  const mediaIdentity = displayMedia.map((item) => item.src).join("|");
  const activeMedia = displayMedia[activeIndex] ?? displayMedia[0];
  const hasMultipleMedia = displayMedia.length > 1;
  const projectDocumentUrl = documentUrl || documentationUrl;

  const viewportAspectRatio = Math.SQRT2;

  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [mediaIdentity, projectTitle]);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lightboxCloseRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (returnFocus?.isConnected) {
        returnFocus.focus();
      }
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowRight" && hasMultipleMedia) {
        setActiveIndex((current) => (current + 1) % displayMedia.length);
      }

      if (event.key === "ArrowLeft" && hasMultipleMedia) {
        setActiveIndex((current) => (current - 1 + displayMedia.length) % displayMedia.length);
      }

      if (event.key === "Tab") {
        const focusable = Array.from(
          lightboxRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]") || [],
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [displayMedia.length, hasMultipleMedia, lightboxOpen]);

  if (!activeMedia) {
    return (
      <div className="portfolio-gallery">
        <div className="portfolio-gallery__stage surface">
          <div className="portfolio-gallery__toolbar">
            <p className="kicker">Project images</p>
            <div className="portfolio-gallery__actions">
              {projectDocumentUrl ? (
                <a
                  className="button button--secondary"
                  href={projectDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open project document
                </a>
              ) : null}
            </div>
          </div>

          <div className="portfolio-gallery__caption">
            <div>
              <strong>{projectTitle}</strong>
              <p>No project image is available for this project.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="portfolio-gallery">
        <div className="portfolio-gallery__stage surface">
          <div className="portfolio-gallery__toolbar">
            <p className="kicker">Project images</p>
            <div className="portfolio-gallery__actions">
              {projectDocumentUrl ? (
                <a
                  className="button button--secondary"
                  href={projectDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open project document
                </a>
              ) : null}
              {activeMedia ? (
                <button className="button button--ghost" type="button" onClick={() => setLightboxOpen(true)}>
                  View full screen
                </button>
              ) : null}
            </div>
          </div>

          <div className="portfolio-gallery__viewport">
            <MediaFrame
              alt={activeMedia.alt}
              aspectRatio={viewportAspectRatio}
              fit="contain"
              loading="eager"
              src={activeMedia.src}
            />

            <button
              aria-label={`View ${activeMedia.title || projectTitle} full screen`}
              className="portfolio-gallery__fullscreen"
              type="button"
              onClick={() => setLightboxOpen(true)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
              </svg>
              <span>View full screen</span>
            </button>

            {hasMultipleMedia ? (
              <>
                <button
                  aria-label="Previous project image"
                  className="gallery-nav gallery-nav--prev"
                  type="button"
                  onClick={() => setActiveIndex((current) => (current - 1 + displayMedia.length) % displayMedia.length)}
                >
                  ‹
                </button>
                <button
                  aria-label="Next project image"
                  className="gallery-nav gallery-nav--next"
                  type="button"
                  onClick={() => setActiveIndex((current) => (current + 1) % displayMedia.length)}
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          <div className="portfolio-gallery__caption">
            <div>
              <strong>{activeMedia.title || projectTitle}</strong>
              {activeMedia.description ? <p>{activeMedia.description}</p> : null}
            </div>
            <span>
              {activeIndex + 1} / {displayMedia.length}
            </span>
          </div>

          {hasMultipleMedia ? (
            <div className="gallery-dots" aria-label="Project media pagination">
              {displayMedia.map((item, index) => (
                <button
                  key={item.id}
                  aria-label={`View project image ${index + 1}`}
                  className={`gallery-dots__dot${index === activeIndex ? " gallery-dots__dot--active" : ""}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {lightboxOpen && typeof document !== "undefined" ? createPortal(
        <div
          ref={lightboxRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setLightboxOpen(false);
            }
          }}
        >
          <button
            ref={lightboxCloseRef}
            aria-label="Close full-screen image viewer"
            className="lightbox__close"
            type="button"
            onClick={() => setLightboxOpen(false)}
          >
            ×
          </button>

          <div className="lightbox__inner">
            <div className="lightbox__frame">
              <MediaFrame
                alt={activeMedia.alt}
                aspectRatio={viewportAspectRatio}
                fit="contain"
                loading="eager"
                src={activeMedia.src}
              />

              {hasMultipleMedia ? (
                <>
                  <button
                    aria-label="Previous lightbox image"
                    className="gallery-nav gallery-nav--prev"
                    type="button"
                    onClick={() => setActiveIndex((current) => (current - 1 + displayMedia.length) % displayMedia.length)}
                  >
                    ‹
                  </button>
                  <button
                    aria-label="Next lightbox image"
                    className="gallery-nav gallery-nav--next"
                    type="button"
                    onClick={() => setActiveIndex((current) => (current + 1) % displayMedia.length)}
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>

            <div className="lightbox__meta">
              <strong id={dialogTitleId}>{activeMedia.title || projectTitle}</strong>
              {activeMedia.description ? <p>{activeMedia.description}</p> : null}
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
