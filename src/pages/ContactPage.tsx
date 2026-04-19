import { FormEvent, useState } from "react";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { contactUseCases, siteMeta } from "../content/siteContent";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Seo
        title="Contact"
        description="Contact details and enquiry scaffold for Daniel Clancy."
        path="/contact"
      />

      <section className="hero hero--subpage hero--contact hero--casefile">
        <div className="container hero__grid hero__grid--contact">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Direct contact</p>
            <h1>Contact Daniel Clancy</h1>
            <p className="hero__summary">
              Built for recruiter outreach, portfolio follow-up, and direct professional enquiry.
            </p>
            <p className="hero__support">
              The page stays sparse on purpose: real contact details first, local-only enquiry scaffold
              second, no unnecessary routing layer.
            </p>
          </div>

          <aside className="surface surface--soft reveal reveal--delay">
            <p className="contact-card__label">Primary details</p>
            <h2>{siteMeta.name}</h2>
            <div className="contact-stack">
              <a href={`mailto:${siteMeta.contact.email}`}>{siteMeta.contact.email}</a>
              <a href="tel:+61458747524">{siteMeta.contact.phone}</a>
              <p>{siteMeta.contact.postal}</p>
              <p>{siteMeta.contact.location}</p>
            </div>
          </aside>
        </div>
      </section>

      <Section
        eyebrow="Professional enquiries"
        title="Deliberate contact framing with a clean form shell."
        intro="Email and phone remain the real contact routes. The form stays presentable and local-only until delivery wiring is intentionally added."
      >
        <div className="two-column-grid two-column-grid--contact">
          <form className="surface form-shell form-shell--feature" onSubmit={handleSubmit}>
            <label>
              Name
              <input name="name" type="text" placeholder="John Smith" />
            </label>
            <label>
              Email
              <input name="email" type="email" placeholder="hello@example.com" />
            </label>
            <label>
              Company
              <input name="company" type="text" placeholder="Company name" />
            </label>
            <label>
              Message
              <textarea
                name="message"
                rows={6}
                placeholder="Project, role, or review context"
              />
            </label>
            <button className="button button--primary" type="submit">
              Submit enquiry scaffold
            </button>
            <p className="form-note">
              {submitted
                ? "Submission remains local-only in this milestone. Use email or phone for active contact."
                : "Delivery wiring is intentionally deferred until the employer-facing foundation is settled."}
            </p>
          </form>

          <div className="contact-sidebar">
            <article className="surface surface--soft">
              <p className="contact-card__label">Best use cases</p>
              <h3>How this contact route is intended to be used</h3>
              <ul className="bullet-list">
                {contactUseCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="surface surface--soft">
              <p className="contact-card__label">Response path</p>
              <p>
                The public build is designed for direct professional outreach rather than a CRM or
                support-queue workflow.
              </p>
            </article>
          </div>
        </div>
      </Section>
    </>
  );
}
