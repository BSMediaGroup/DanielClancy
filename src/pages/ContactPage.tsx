import { FormEvent, useCallback, useEffect, useState } from "react";
import { ContactMap } from "../components/ContactMap";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { shellAssets } from "../content/brandAssets";
import { contactUseCases, siteMeta } from "../content/siteContent";
import { TurnstileChallenge } from "../lib/turnstile";

type ContactStatus = "idle" | "submitting" | "success" | "error";

const initialValues = {
  name: "",
  email: "",
  company: "",
  subject: "",
  message: "",
  website: "",
};

export function ContactPage() {
  const [values, setValues] = useState(initialValues);
  const [startedAt, setStartedAt] = useState("");
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileTokenIssuedAt, setTurnstileTokenIssuedAt] = useState(0);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  useEffect(() => {
    setStartedAt(String(Date.now()));
  }, []);

  const handleTurnstileTokenChange = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileTokenIssuedAt(token ? Date.now() : 0);
  }, []);

  function resetTurnstile() {
    setTurnstileToken("");
    setTurnstileTokenIssuedAt(0);
    setTurnstileResetKey((value) => value + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "submitting") {
      return;
    }

    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setStatus("error");
      setStatusMessage("Please complete your name, email, and message before sending.");
      return;
    }

    if (!turnstileToken || !turnstileTokenIssuedAt) {
      setStatus("error");
      setStatusMessage("Please complete the security check before sending.");
      return;
    }

    setStatus("submitting");
    setStatusMessage("Sending message…");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          startedAt,
          sourcePath: window.location.pathname,
          turnstileToken,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        code?: string;
        mode?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to send your message right now.");
      }

      setStatus("success");
      setStatusMessage(payload.message ?? "Thanks. Your message has been sent.");
      setValues(initialValues);
      setStartedAt(String(Date.now()));
      resetTurnstile();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to send your message right now.";
      setStatus("error");
      setStatusMessage(message);
      resetTurnstile();
    }
  }

  return (
    <>
      <Seo
        title="Contact"
        description="Professional contact details and enquiry form for Daniel Clancy."
        path="/contact"
        image={shellAssets.professionalShare}
      />

      <section className="hero hero--subpage contact-hero">
        <div className="container contact-hero__grid">
          <div className="hero-copy">
            <p className="kicker">Contact</p>
            <h1>Professional enquiries and role conversations.</h1>
            <p className="hero-copy__lead">
              For employment opportunities, project discussions, or drafting and design collaboration,
              use the form below or contact Daniel directly.
            </p>
          </div>

          <aside className="surface contact-primary-details">
            <p className="kicker">Primary details</p>
            <div className="contact-stack">
              <a href={`mailto:${siteMeta.contact.email}`}>{siteMeta.contact.email}</a>
              <a href="tel:+61458747524">{siteMeta.contact.phone}</a>
              <p>{siteMeta.contact.location}</p>
            </div>
          </aside>
        </div>
      </section>

      <Section
        eyebrow="Get in touch"
        title="Start a conversation."
        intro="Share the role, project or context for your enquiry and Daniel will respond directly."
        className="contact-section"
      >
        <div className="contact-workspace">
          <form className="surface form-shell" onSubmit={handleSubmit} aria-busy={status === "submitting"}>
            <div className="form-grid">
              <label>
                Name
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  disabled={status === "submitting"}
                  value={values.name}
                  onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={status === "submitting"}
                  value={values.email}
                  onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                  placeholder="hello@example.com"
                />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Company
                <input
                  name="company"
                  type="text"
                  autoComplete="organization"
                  disabled={status === "submitting"}
                  value={values.company}
                  onChange={(event) => setValues((current) => ({ ...current, company: event.target.value }))}
                  placeholder="Company or studio"
                />
              </label>
              <label>
                Subject
                <input
                  name="subject"
                  type="text"
                  disabled={status === "submitting"}
                  value={values.subject}
                  onChange={(event) => setValues((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="Reason for contact"
                />
              </label>
            </div>

            <label className="form-field--hidden" aria-hidden="true">
              Website
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                disabled={status === "submitting"}
                value={values.website}
                onChange={(event) => setValues((current) => ({ ...current, website: event.target.value }))}
              />
            </label>

            <input name="startedAt" type="hidden" value={startedAt} readOnly />

            <label>
              Message
              <textarea
                name="message"
                rows={8}
                required
                disabled={status === "submitting"}
                value={values.message}
                onChange={(event) => setValues((current) => ({ ...current, message: event.target.value }))}
                placeholder="Share the role, project, or context for your enquiry."
              />
            </label>

            <TurnstileChallenge
              actionLabel="send this enquiry"
              resetKey={turnstileResetKey}
              onTokenChange={handleTurnstileTokenChange}
            />

            <div className="form-actions">
              <button className="button button--primary" disabled={status === "submitting" || !turnstileToken} type="submit">
                {status === "submitting" ? "Sending…" : "Send enquiry"}
              </button>
              <p className={`form-status form-status--${status}`} role="status" aria-live="polite">
                {statusMessage}
              </p>
            </div>
          </form>

          <aside className="contact-sidebar">
            <article className="surface contact-map-card">
              <div className="contact-map-card__head">
                <p className="kicker">Based in Sydney</p>
                <h3>Sydney, New South Wales</h3>
              </div>
              <ContactMap />
            </article>

            <article className="surface contact-focus-card">
              <p className="kicker">Relevant enquiries</p>
              <ul className="bullet-list">
                {contactUseCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </aside>
        </div>
      </Section>
    </>
  );
}
