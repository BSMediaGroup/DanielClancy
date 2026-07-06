import { ExternalLink, LegalPageLayout, type LegalSectionDefinition } from "../components/LegalPageLayout";

const lastUpdated = "26 June 2026";

const termsSections: LegalSectionDefinition[] = [
  {
    id: "overview",
    title: "Overview",
    summary: "A plain-English summary of these website terms.",
    children: (
      <>
        <p>
          These Terms of Use explain the rules for using DanielClancy.net, including portfolio
          content, CV material, contact features, accounts, OAuth login, media integrations, /watch
          content, analytics, APIs, Cloudflare security features, and third-party services.
        </p>
        <p>
          This page is intended to describe the website's practices and terms in plain English. It is
          not a substitute for legal advice.
        </p>
      </>
    ),
  },
  {
    id: "acceptance-of-terms",
    title: "Acceptance of terms",
    summary: "Using the site means you agree to these terms.",
    children: (
      <>
        <p>
          By accessing or using DanielClancy.net, you agree to these Terms of Use and the
          <a className="legal-link" href="/privacy"> Privacy Policy</a>. If you do not agree, you
          should not use the site.
        </p>
        <p>
          Some features may also be governed by third-party terms, provider policies, OAuth consent
          screens, payment provider rules, media platform terms, or Cloudflare policies.
        </p>
      </>
    ),
  },
  {
    id: "site-purpose",
    title: "Site purpose",
    summary: "The site is a portfolio, CV, project, contact, and media surface.",
    children: (
      <>
        <p>
          DanielClancy.net is a professional portfolio, CV, project evidence, contact, and media
          website for Daniel Clancy / Brainstream Media Group. It is intended for professional
          presentation, employer-facing review, portfolio assessment, project reference, contact, and
          related public media access.
        </p>
        <p>
          The /watch page and similar media surfaces may display public livestream, video, channel,
          and platform metadata from services such as YouTube or other providers where implemented.
        </p>
      </>
    ),
  },
  {
    id: "accounts-and-access",
    title: "Accounts and access",
    summary: "Some features use account or provider login; admin areas are restricted.",
    children: (
      <>
        <p>
          Some features may require login. Public customer login is routed through the same-origin
          account pages and server-side magic-link endpoints. Email/password admin login, where
          available, is handled by server-side auth endpoints.
        </p>
        <p>
          Admin areas are restricted and are not public account entitlements. Account access may be
          limited, revoked, or refused for misuse, suspected abuse, security risk, provider failure,
          misconfiguration, or lack of required authorization.
        </p>
        <p>
          You are responsible for protecting your own provider accounts, credentials, devices, and
          browser sessions. DanielClancy.net is not responsible for unauthorized access caused by
          compromise of your provider account or device.
        </p>
      </>
    ),
  },
  {
    id: "oauth-and-third-party-services",
    title: "OAuth and third-party services",
    summary: "Provider terms may apply when you use login, embeds, APIs, or external services.",
    children: (
      <>
        <p>
          When you use OAuth, embedded media, payment flows, API-powered features, maps, analytics,
          security checks, or external links, third-party provider terms and policies may apply in
          addition to these Terms of Use.
        </p>
        <p>
          Provider content, login screens, consent prompts, availability, account controls, and
          provider-side data practices remain governed by those providers. DanielClancy.net does not
          control provider accounts or provider policy changes.
        </p>
      </>
    ),
  },
  {
    id: "watch-media-and-platform-content",
    title: "Watch, media, and platform content",
    summary: "Media content and metadata remain subject to the relevant platform.",
    children: (
      <>
        <p>
          The /watch page can display public media content and platform metadata, including titles,
          thumbnails, channel names, upload dates, stream state, embed URLs, video URLs, and related
          public details. The current implemented provider phase is YouTube through a server-side
          integration.
        </p>
        <p>
          Platform APIs, embeds, policies, limits, and availability may change without notice.
          A provider outage, API change, rate limit, content removal, or configuration issue may cause
          media content to be unavailable or shown as not live.
        </p>
      </>
    ),
  },
  {
    id: "youtube-api-services-terms",
    title: "YouTube API Services terms",
    summary: "Additional terms for YouTube-powered features and YouTube content.",
    children: (
      <>
        <p>
          By accessing features that use YouTube API Services or YouTube content, you are also
          agreeing to be bound by the YouTube Terms of Service. YouTube API Services and related
          developer handling are also subject to Google and YouTube API policies.
        </p>
        <p>
          DanielClancy.net uses YouTube data to display media/watch content and related metadata. You
          may revoke Google or YouTube API access through Google security settings where applicable.
        </p>
        <ul>
          <li><ExternalLink href="https://www.youtube.com/t/terms">YouTube Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://developers.google.com/youtube/terms/api-services-terms-of-service">YouTube API Services Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://developers.google.com/youtube/terms/developer-policies">YouTube API Services Developer Policies</ExternalLink></li>
          <li><ExternalLink href="https://policies.google.com/privacy">Google Privacy Policy</ExternalLink></li>
          <li><ExternalLink href="https://security.google.com/settings/security/permissions">Google security permissions and revocation</ExternalLink></li>
        </ul>
      </>
    ),
  },
  {
    id: "twitch-kick-x-github-google-terms",
    title: "Twitch, Kick, X, GitHub, and Google terms",
    summary: "Provider terms for streaming, OAuth, API, and embedded services.",
    children: (
      <>
        <p>
          Provider content, login, OAuth, API, and embedded services remain governed by those
          providers. The following links are provided for convenience:
        </p>
        <ul>
          <li><ExternalLink href="https://dev.twitch.tv/docs">Twitch Developer Documentation</ExternalLink></li>
          <li><ExternalLink href="https://www.twitch.tv/p/en/legal/terms-of-service/">Twitch Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://www.twitch.tv/p/en/legal/privacy-notice/">Twitch Privacy Notice</ExternalLink></li>
          <li><ExternalLink href="https://dev.kick.com/terms-of-service">Kick Developer Terms</ExternalLink></li>
          <li><ExternalLink href="https://kick.com/terms-of-service">Kick Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://docs.x.com/developer-terms/agreement">X Developer Agreement</ExternalLink></li>
          <li><ExternalLink href="https://docs.x.com/developer-terms/policy">X Developer Policy</ExternalLink></li>
          <li><ExternalLink href="https://x.com/en/privacy">X Privacy Policy</ExternalLink></li>
          <li><ExternalLink href="https://x.com/en/tos">X Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://docs.github.com/site-policy/github-terms/github-terms-of-service">GitHub Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement">GitHub Privacy Statement</ExternalLink></li>
          <li><ExternalLink href="https://policies.google.com/terms">Google Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://policies.google.com/privacy">Google Privacy Policy</ExternalLink></li>
          <li><ExternalLink href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</ExternalLink></li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    summary: "Rules for using the site responsibly.",
    children: (
      <>
        <p>You must not use DanielClancy.net to:</p>
        <ul>
          <li>Break the law, infringe rights, harass, defame, threaten, or abuse others.</li>
          <li>Bypass authentication, access admin-only areas, or test admin restrictions without authorization.</li>
          <li>Scrape, crawl, hammer, replay, automate, or extract content beyond normal browsing and reasonable public linking.</li>
          <li>Interfere with Cloudflare, Turnstile, auth, payments, analytics, logging, rate limits, or other security features.</li>
          <li>Submit malicious code, exploit payloads, credential stuffing attempts, spam, deceptive content, or abusive contact-form messages.</li>
          <li>Impersonate Daniel Clancy, Brainstream Media Group, a provider, an employer, a client, or another person.</li>
          <li>Attempt to extract API keys, secrets, OAuth credentials, private admin data, internal CMS records, or restricted provider data.</li>
          <li>Copy, republish, or misuse portfolio, CV, branding, design, media, project, or website content in an unauthorized way.</li>
        </ul>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    summary: "Site content is protected; third-party marks belong to their owners.",
    children: (
      <>
        <p>
          The site design, text, layout, presentation, portfolio material, project summaries, images,
          branding, code arrangement, visual system, and other original website content are protected
          by intellectual property laws unless otherwise stated.
        </p>
        <p>
          Third-party logos, platform icons, company names, software names, employer/client names, and
          media platform content remain the property of their respective owners and are used
          descriptively, nominatively, for provider login, for project context, or as part of public
          media/embed functionality.
        </p>
        <p>
          You receive no broad license beyond normal personal browsing, reasonable linking, and
          reasonable quotation with attribution where lawful. Public media embeds remain subject to
          the relevant provider's terms.
        </p>
      </>
    ),
  },
  {
    id: "portfolio-cv-and-professional-content",
    title: "Portfolio, CV, and professional content",
    summary: "Professional materials are presented with reasonable care, not as guarantees.",
    children: (
      <>
        <p>
          Portfolio and CV content may include project records, client/studio/company/software
          references, documents, images, roles, dates, capabilities, and selected examples of
          professional work. Reasonable efforts are made to keep public content accurate and
          source-backed.
        </p>
        <p>
          Portfolio and CV content is not a guarantee of employment, endorsement, current affiliation,
          current role, provider approval, client approval, or ongoing commercial relationship.
          Third-party company, software, and platform names are used descriptively.
        </p>
        <p>
          Errors, outdated facts, attribution concerns, or privacy concerns can be reported to
          <a href="mailto:mail@danielclancy.net"> mail@danielclancy.net</a>.
        </p>
      </>
    ),
  },
  {
    id: "user-submitted-content-and-contact",
    title: "User-submitted content and contact",
    summary: "How messages and submitted material may be handled.",
    children: (
      <>
        <p>
          If you submit a contact form, email, file reference, link, request, or other message, you
          authorize DanielClancy.net to receive, process, store, forward, and respond to that content
          as reasonably needed to handle the enquiry, protect the site, and maintain records.
        </p>
        <p>
          You must not submit unlawful, confidential, privileged, malicious, deceptive, infringing, or
          abusive material unless you are authorized to do so and it is appropriate for the enquiry.
          Do not submit passwords, API keys, OAuth tokens, payment credentials, or other sensitive
          secrets through general contact channels.
        </p>
      </>
    ),
  },
  {
    id: "analytics-security-and-anti-abuse",
    title: "Analytics, security, and anti-abuse",
    summary: "Operational logging and analytics support reliability and security.",
    children: (
      <>
        <p>
          DanielClancy.net may record page visits, request metadata, referrer information, browser,
          device, platform, timezone, approximate Cloudflare location metadata, security events, form
          validation state, and related operational information.
        </p>
        <p>
          This data is used to understand site usage, maintain reliability, investigate abuse, debug
          problems, protect forms and admin boundaries, and forward event-only alerts or analytics to
          configured services such as DanielClancy-Admin or StreamSuites. Alert and analytics
          forwarding must not expose browser-side secrets or create public authority over admin or
          StreamSuites rule definitions.
        </p>
      </>
    ),
  },
  {
    id: "cloudflare-turnstile-and-infrastructure",
    title: "Cloudflare, Turnstile, and infrastructure",
    summary: "Cloudflare services support hosting, routing, caching, functions, and security.",
    children: (
      <>
        <p>
          The site is Cloudflare Pages-compatible and may use Cloudflare Pages, Pages Functions, KV,
          R2, Workers-style request processing, caching, logs, request metadata, and Turnstile
          challenges. You must not interfere with, bypass, or abuse these systems.
        </p>
        <ul>
          <li><ExternalLink href="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy Policy</ExternalLink></li>
          <li><ExternalLink href="https://www.cloudflare.com/turnstile-privacy-policy/">Cloudflare Turnstile Privacy Addendum</ExternalLink></li>
          <li><ExternalLink href="https://www.cloudflare.com/website-terms/">Cloudflare Website Terms</ExternalLink></li>
        </ul>
      </>
    ),
  },
  {
    id: "third-party-links-and-embeds",
    title: "Third-party links and embeds",
    summary: "External services are not controlled by DanielClancy.net.",
    children: (
      <>
        <p>
          The site may link to or embed third-party content, including YouTube, social platforms,
          payment providers, OAuth providers, employers, project references, media platforms, and
          other websites. Those services may change, fail, set cookies, collect information, or apply
          their own rules.
        </p>
        <p>
          DanielClancy.net is not responsible for third-party websites, provider outages, provider
          terms, provider policy changes, external content accuracy, or third-party data practices.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    summary: "The site is provided as-is, with provider dependencies and no professional advice.",
    children: (
      <>
        <p>
          To the extent permitted by law, DanielClancy.net is provided "as is" and "as available"
          without a guarantee that it will be uninterrupted, error-free, current, secure, compatible
          with every browser, or available in every location.
        </p>
        <p>
          The site does not provide legal, financial, engineering, architectural, migration, tax,
          employment, or other professional advice. Third-party APIs, providers, embeds, payment
          services, OAuth systems, and Cloudflare services may change or be unavailable.
        </p>
        <p>
          Nothing in these terms excludes, restricts, or modifies any consumer guarantee, statutory
          right, or other right that cannot be excluded under applicable law, including the Australian
          Consumer Law where it applies.
        </p>
      </>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of liability",
    summary: "Liability is limited to the extent the law allows.",
    children: (
      <>
        <p>
          To the extent permitted by law, Daniel Clancy and Brainstream Media Group are not liable for
          indirect, incidental, special, consequential, exemplary, or punitive loss arising from use of
          the site, inability to access the site, provider failure, content errors, security events, or
          third-party services.
        </p>
        <p>
          Where liability cannot be excluded, it is limited only to the extent permitted by applicable
          law. Nothing in these terms attempts to exclude rights that cannot legally be excluded.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    summary: "You may be responsible for misuse or unlawful conduct.",
    children: (
      <>
        <p>
          To the extent permitted by law, you agree to be responsible for claims, losses, liabilities,
          damages, costs, or expenses arising from your misuse of the site, breach of these terms,
          unlawful conduct, infringement of third-party rights, unauthorized access attempts, abusive
          automation, or harmful submissions.
        </p>
      </>
    ),
  },
  {
    id: "suspension-and-termination",
    title: "Suspension and termination",
    summary: "Access may be limited for misuse, risk, or operational reasons.",
    children: (
      <>
        <p>
          DanielClancy.net may suspend, restrict, block, revoke, or terminate access to features,
          accounts, admin surfaces, contact features, or provider-linked functionality where needed
          for security, abuse prevention, operational integrity, provider compliance, legal reasons,
          or suspected breach of these terms.
        </p>
      </>
    ),
  },
  {
    id: "changes-to-the-site-and-terms",
    title: "Changes to the site and terms",
    summary: "The site and terms may change over time.",
    children: (
      <>
        <p>
          DanielClancy.net may update, remove, add, suspend, or change site features, provider
          integrations, routes, content, account features, analytics, security controls, or these
          terms. The last-updated date will identify when these terms were most recently changed.
        </p>
        <p>
          Continued use of the site after changes means the updated terms apply from the updated date,
          unless mandatory law requires a different process.
        </p>
      </>
    ),
  },
  {
    id: "governing-law-and-jurisdiction",
    title: "Governing law and jurisdiction",
    summary: "A careful Australian governing-law clause.",
    children: (
      <>
        <p>
          These terms are governed by the laws of New South Wales, Australia, unless mandatory local
          law provides otherwise. Nothing in this clause limits rights that cannot be excluded or
          changed by agreement under applicable law.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    summary: "Where to send terms, policy, or website enquiries.",
    children: (
      <>
        <p>
          Questions about these Terms of Use, the Privacy Policy, provider integrations, or website
          content can be sent to <a href="mailto:mail@danielclancy.net">mail@danielclancy.net</a>.
        </p>
        <p>
          Please include the relevant page URL, provider account context if applicable, and a concise
          description of the issue. Do not email passwords, API keys, OAuth secrets, or other sensitive
          credentials.
        </p>
      </>
    ),
  },
];

export function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Use"
      subtitle="The rules for using DanielClancy.net, including portfolio content, accounts, media integrations, watch content, analytics, APIs, and third-party services."
      description="Terms of Use for DanielClancy.net covering portfolio content, accounts, OAuth, media/API integrations, acceptable use, intellectual property, and third-party services."
      path="/terms"
      lastUpdated={lastUpdated}
      sections={termsSections}
    />
  );
}
