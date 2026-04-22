import { useEffect, useMemo, useState } from "react";
import { MediaFrame } from "./MediaFrame";
import type { PortfolioMediaItem } from "../content/siteContent";

type PortfolioMediaGalleryProps = {
  projectTitle: string;
  media: PortfolioMediaItem[];
  documentationUrl?: string;
  documentationAvailable?: boolean;
  documentationStatusNote?: string;
};

export function PortfolioMediaGallery({
  projectTitle,
  media,
  documentationUrl,
  documentationAvailable = Boolean(documentationUrl),
  documentationStatusNote,
}: PortfolioMediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeMedia = media[activeIndex] ?? media[0];
  const hasMultipleMedia = media.length > 1;

  const viewportAspectRatio = useMemo(() => {
    if (!activeMedia) {
      return 16 / 9;
    }

    return Math.max(activeMedia.aspectRatio || 16 / 9, 1.45);
  }, [activeMedia]);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowRight" && hasMultipleMedia) {
        setActiveIndex((current) => (current + 1) % media.length);
      }

      if (event.key === "ArrowLeft" && hasMultipleMedia) {
        setActiveIndex((current) => (current - 1 + media.length) % media.length);
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [hasMultipleMedia, lightboxOpen, media.length]);

  if (!activeMedia) {
    return (
      <div className="portfolio-gallery">
        <div className="portfolio-gallery__stage surface">
          <div className="portfolio-gallery__toolbar">
            <p className="kicker">Project media</p>
            <div className="portfolio-gallery__actions">
              {documentationUrl ? (
                <a
                  className="button button--secondary"
                  href={documentationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open document folder
                </a>
              ) : documentationStatusNote ? (
                <button
                  aria-disabled="true"
                  className="button button--secondary button--disabled"
                  disabled
                  title={documentationStatusNote}
                  type="button"
                >
                  Document folder unavailable
                </button>
              ) : null}
            </div>
          </div>

          <div className="portfolio-gallery__caption">
            <div>
              <strong>{projectTitle}</strong>
              <p>No matching local Wix-exported image was found for this public record.</p>
              {documentationStatusNote ? (
                <p className="portfolio-gallery__status-note">{documentationStatusNote}</p>
              ) : null}
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
            <p className="kicker">Project media</p>
            <div className="portfolio-gallery__actions">
              {documentationUrl ? (
                <a
                  className="button button--secondary"
                  href={documentationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open document folder
                </a>
              ) : documentationStatusNote ? (
                <button
                  aria-disabled="true"
                  className="button button--secondary button--disabled"
                  disabled
                  title={documentationStatusNote}
                  type="button"
                >
                  Document folder unavailable
                </button>
              ) : null}
              {activeMedia ? (
                <button className="button button--ghost" type="button" onClick={() => setLightboxOpen(true)}>
                  Expand
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

            {hasMultipleMedia ? (
              <>
                <button
                  aria-label="Previous project image"
                  className="gallery-nav gallery-nav--prev"
                  type="button"
                  onClick={() => setActiveIndex((current) => (current - 1 + media.length) % media.length)}
                >
                  ‹
                </button>
                <button
                  aria-label="Next project image"
                  className="gallery-nav gallery-nav--next"
                  type="button"
                  onClick={() => setActiveIndex((current) => (current + 1) % media.length)}
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          <div className="portfolio-gallery__caption">
            <div>
              <strong>{activeMedia.title || projectTitle}</strong>
              <p>{activeMedia.description || `Documentation view for ${projectTitle}.`}</p>
              {documentationStatusNote ? (
                <p className="portfolio-gallery__status-note">{documentationStatusNote}</p>
              ) : null}
            </div>
            <span>
              {activeIndex + 1} / {media.length}
            </span>
          </div>

          {hasMultipleMedia ? (
            <div className="gallery-dots" aria-label="Project media pagination">
              {media.map((item, index) => (
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

      {lightboxOpen ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${projectTitle} gallery`}>
          <button
            aria-label="Close gallery"
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
                    onClick={() => setActiveIndex((current) => (current - 1 + media.length) % media.length)}
                  >
                    ‹
                  </button>
                  <button
                    aria-label="Next lightbox image"
                    className="gallery-nav gallery-nav--next"
                    type="button"
                    onClick={() => setActiveIndex((current) => (current + 1) % media.length)}
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>

            <div className="lightbox__meta">
              <strong>{activeMedia.title || projectTitle}</strong>
              <p>{activeMedia.description || `Documentation view for ${projectTitle}.`}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
