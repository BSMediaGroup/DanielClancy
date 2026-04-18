import { FormEvent, useState } from "react";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { siteMeta } from "../content/siteContent";

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

      <section className="hero hero--subpage">
        <div className="container hero__grid">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Direct contact</p>
            <h1>Contact Daniel Clancy</h1>
            <p className="hero__summary">
              This route keeps the live site’s direct-contact emphasis while
              staying explicit that form delivery wiring is a later milestone.
            </p>
          </div>

          <div className="surface reveal reveal--delay">
            <p className="contact-card__label">Primary contact details</p>
            <h2>{siteMeta.contact.email}</h2>
            <a href="tel:+61458747524">{siteMeta.contact.phone}</a>
            <p>{siteMeta.contact.postal}</p>
            <p>{siteMeta.contact.location}</p>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Enquiry form"
        title="Presentable now, delivery integration later."
        intro="For this milestone the form captures layout, tone, and field structure only. Email and phone remain the real contact channels."
      >
        <div className="two-column-grid">
          <form className="surface form-shell" onSubmit={handleSubmit}>
            <label>
              Name
              <input name="name" type="text" placeholder="Your name" />
            </label>
            <label>
              Email
              <input name="email" type="email" placeholder="name@company.com" />
            </label>
            <label>
              Company
              <input name="company" type="text" placeholder="Organisation" />
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
                ? "Form capture is intentionally local-only in this milestone. Use email or phone for real contact."
                : "Submission handling is not yet wired to email, CMS, or CRM infrastructure."}
            </p>
          </form>

          <div className="surface">
            <h3>Best use cases for this site</h3>
            <ul className="bullet-list">
              <li>Recruiter and hiring manager review</li>
              <li>CV and experience verification</li>
              <li>Project sample and drafting capability assessment</li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
