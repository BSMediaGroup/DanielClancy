import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { shellAssets, socialIcons } from "../content/brandAssets";

const supportMethods = [
  {
    title: "Card payments",
    note: "Prepared for a direct card checkout or hosted payment form.",
    icon: socialIcons.payments,
  },
  {
    title: "PayPal",
    note: "Reserved for a familiar wallet route and one-off support flow.",
    icon: socialIcons.payments,
  },
  {
    title: "Hosted payment link",
    note: "Ready for a Stripe Payment Link or equivalent hosted checkout option.",
    icon: socialIcons.locals,
  },
  {
    title: "Apple Pay / Google Pay",
    note: "Messaging space for accelerated wallets when the live processor is connected.",
    icon: socialIcons.apple,
  },
];

export function DonatePage() {
  return (
    <>
      <Seo
        title="Donate"
        description="Support page for Daniel Clancy content creation and design projects."
        path="/donate"
        noIndex
        image={shellAssets.personalShare}
      />

      <section className="hero hero--donate">
        <div className="container hero-split hero-split--personal">
          <div className="hero-copy">
            <p className="kicker">Support</p>
            <h1>Support Daniel&apos;s content creation and independent design work.</h1>
            <p className="hero-copy__lead">
              The donation surface is now structured like a real support page, while payment logic
              remains deferred until the live processor details are ready.
            </p>
          </div>

          <article className="surface surface--glow">
            <p className="kicker">Support use</p>
            <h2>Future funding can support videos, streams, gear, research, and studio time.</h2>
            <p>
              The layout already separates payment methods, trust cues, and future hosted options so the
              live cutover can remain mostly wiring rather than design work.
            </p>
          </article>
        </div>
      </section>

      <Section
        eyebrow="Support methods"
        title="Payment-ready blocks without live processing."
        intro="Nothing here charges the user yet, but the page is now structured as a considered support surface ready for later payment wiring."
      >
        <div className="project-grid">
          {supportMethods.map((item) => (
            <article key={item.title} className="surface">
              <div className="icon-heading">
                <img alt="" src={item.icon} />
                <h3>{item.title}</h3>
              </div>
              <p>{item.note}</p>
              <span className="status-pill">Coming online later</span>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
