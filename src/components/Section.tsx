import { ReactNode } from "react";

type SectionProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
};

export function Section({
  eyebrow,
  title,
  intro,
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={`section ${className}`.trim()}>
      <div className="section__band" aria-hidden="true" />
      <div className="container">
        <div className="section-heading">
          {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
          {intro ? <p className="section-heading__intro">{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
