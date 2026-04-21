import { useEffect, useState } from "react";

type CapabilityMeterProps = {
  name: string;
  note: string;
  score: number;
  logo?: string;
};

export function CapabilityMeter({ name, note, score, logo }: CapabilityMeterProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAnimationKey(1);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <article className="capability-row" onMouseEnter={() => setAnimationKey((current) => current + 1)}>
      <div className="capability-row__header">
        <div className="capability-row__title">
          {logo ? <img alt="" src={logo} /> : null}
          <div>
            <h3>{name}</h3>
            <p>{note}</p>
          </div>
        </div>
        <strong>{score}%</strong>
      </div>
      <div className="capability-bar" aria-hidden="true">
        <span
          key={`${name}-${animationKey}`}
          className="capability-bar__fill"
          style={{ ["--capability" as string]: `${score}%` }}
        />
      </div>
    </article>
  );
}
