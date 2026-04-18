import { Link } from "react-router-dom";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";

const supportOptions = [
  {
    title: "One-off support",
    body: "Placeholder area for a future Stripe or PayPal single-contribution flow.",
  },
  {
    title: "Project support",
    body: "Placeholder area for direct support tied to streams, creative output, or equipment needs.",
  },
  {
    title: "Recurring support",
    body: "Placeholder area for subscription-style support if that becomes appropriate later.",
  },
];

export function DonatePage() {
  return (
    <>
      <Seo
        title="Donate"
        description="Private utility scaffold for future support and donation flows."
        path="/donate"
        noIndex
      />

      <section className="hero hero--utility hero--utility-alt">
        <div className="container hero__grid">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Hidden utility route</p>
            <h1>Donate</h1>
            <p className="hero__summary">
              This route is intentionally isolated from the employer-facing site
              and exists only as a future support-page foundation.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" to="/">
                Return to main site
              </Link>
            </div>
          </div>

          <div className="surface reveal reveal--delay">
            <p className="contact-card__label">Integration status</p>
            <h2>Not connected yet</h2>
            <p>
              Stripe, PayPal, tax/disclaimer handling, and donation messaging are
              all deferred until the public-site foundation is stable.
            </p>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Support flow scaffold"
        title="Payment-ready structure without live payments."
        intro="This milestone does not expose any real payment buttons or checkout logic."
      >
        <div className="utility-grid">
          {supportOptions.map((item) => (
            <article key={item.title} className="surface utility-card">
              <span className="utility-badge">Placeholder</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
