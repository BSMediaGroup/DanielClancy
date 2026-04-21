import { FormEvent, useEffect, useState } from "react";
import { ContactMap } from "../components/ContactMap";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { shellAssets } from "../content/brandAssets";
import { contactUseCases, siteMeta } from "../content/siteContent";

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

  useEffect(() => {
    setStartedAt(String(Date.now()));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setStatus("error");
      setStatusMessage("Please complete your name, email, and message before sending.");
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
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        mode?: string;
      };

      if (
        response.status === 404 &&
        (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost")
      ) {
        setStatus("success");
        setStatusMessage(
          "Local preview mode validated the form successfully. Delivery is ready for the deployed Pages Function.",
        );
        setValues(initialValues);
        setStartedAt(String(Date.now()));
        return;
      }

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to send your message right now.");
      }

      setStatus("success");
      setStatusMessage(
        payload.mode === "mock"
          ? "Local preview mode validated the form successfully. Delivery is ready for the deployed Pages Function."
          : payload.message ?? "Message sent successfully.",
      );
      setValues(initialValues);
      setStartedAt(String(Date.now()));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to send your message right now.";
      setStatus("error");
      setStatusMessage(message);
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

      <section className="hero hero--subpage">
        <div className="container hero-split hero-split--contact">
          <div className="hero-copy">
            <p className="kicker">Contact</p>
            <h1>Direct contact for professional enquiries, project follow-up, and collaboration.</h1>
            <p className="hero-copy__lead">
              Use the form for introductions, project discussions, or role conversations. Messages are
              delivered server-side for Cloudflare Pages deployment, and the page now includes a Sydney
              location map for fast spatial context.
            </p>
          </div>

          <aside className="surface">
            <p className="kicker">Primary details</p>
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
        eyebrow="Location"
        title="Sydney-based with a map surface that matches the site."
        intro="The map stays static-host friendly while using a dark presentation, a custom studio marker, and a restrained hover tooltip."
        className="section--muted"
      >
        <div className="two-column-grid two-column-grid--contact">
          <article className="surface surface--map">
            <ContactMap />
          </article>

          <article className="surface">
            <p className="kicker">Base</p>
            <h3>Sydney CBD context</h3>
            <p>
              Daniel Clancy is based in Sydney, New South Wales, with the professional contact surface
              anchored to the CBD for quick geographic reference.
            </p>
            <div className="info-list">
              <div>
                <span>City</span>
                <strong>Sydney</strong>
              </div>
              <div>
                <span>Region</span>
                <strong>New South Wales</strong>
              </div>
              <div>
                <span>Postal</span>
                <strong>{siteMeta.contact.postal}</strong>
              </div>
            </div>
          </article>
        </div>
      </Section>

      <Section
        eyebrow="Send a message"
        title="A polished contact form with safe first-pass delivery handling."
        intro="The form validates required fields, uses a honeypot and timing check, and sends through a Pages Function when deployment wiring is available."
      >
        <div className="two-column-grid two-column-grid--contact">
          <form className="surface form-shell" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Name
                <input
                  name="name"
                  type="text"
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
                value={values.message}
                onChange={(event) => setValues((current) => ({ ...current, message: event.target.value }))}
                placeholder="Share the role, project, or context for your enquiry."
              />
            </label>

            <div className="form-actions">
              <button className="button button--primary" disabled={status === "submitting"} type="submit">
                {status === "submitting" ? "Sending…" : "Send enquiry"}
              </button>
              <p className={`form-status form-status--${status}`}>{statusMessage}</p>
            </div>
          </form>

          <div className="surface-stack">
            <article className="surface">
              <p className="kicker">Best fit</p>
              <ul className="bullet-list">
                {contactUseCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="surface">
              <p className="kicker">Delivery</p>
              <p>
                Messages are addressed to <strong>mail@danielclancy.net</strong> with a courtesy copy to{" "}
                <strong>daniel@brainstream.media</strong>. Reply handling stays server-side.
              </p>
            </article>
          </div>
        </div>
      </Section>
    </>
  );
}
