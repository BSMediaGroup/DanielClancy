import { ExternalLink, LegalPageLayout, type LegalSectionDefinition } from "../components/LegalPageLayout";

const lastUpdated = "26 June 2026";

const privacySections: LegalSectionDefinition[] = [
  {
    id: "overview",
    title: "Overview",
    summary: "A plain-English summary of what this policy covers.",
    children: (
      <>
        <p>
          This Privacy Policy explains how DanielClancy.net handles information when you use the
          website, account features, contact form, analytics, media pages, embeds, OAuth sign-in, and
          related Cloudflare Pages Functions.
        </p>
        <p>
          The site is primarily a professional portfolio, CV, project evidence, and media surface. It
          is not intended to collect more information than is reasonably needed to operate the site,
          respond to enquiries, support account and admin boundaries, secure the service, and present
          current or past media content.
        </p>
      </>
    ),
  },
  {
    id: "who-we-are",
    title: "Who we are",
    summary: "DanielClancy.net is operated as the public site for Daniel Clancy and Brainstream Media Group.",
    children: (
      <>
        <p>
          DanielClancy.net is the professional portfolio, CV, contact, and media website for Daniel
          Clancy / Brainstream Media Group. The site presents professional work, project records,
          public media links, account entry points, and contact options associated with Daniel Clancy.
        </p>
        <p>
          Privacy enquiries can be sent to <a href="mailto:mail@danielclancy.net">mail@danielclancy.net</a>.
          This policy does not add or rely on legal registration numbers, office addresses, phone
          numbers, or regulator contacts that are not otherwise published by the site.
        </p>
      </>
    ),
  },
  {
    id: "scope",
    title: "Scope",
    summary: "This policy applies to DanielClancy.net and the site features described here.",
    children: (
      <>
        <p>
          This policy applies to public pages on DanielClancy.net, including the professional site, the
          personal /watch and /donate surfaces, contact forms, login/account entry points, page-visit
          analytics, security checks, and server-side API routes used by the public site.
        </p>
        <p>
          Third-party services, OAuth providers, media platforms, payment providers, and embedded
          content providers have their own terms and privacy policies. Their services are outside the
          direct control of DanielClancy.net even when linked, embedded, or used to power a feature.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    summary: "The categories of information the site may receive or generate.",
    children: (
      <>
        <p>The site may collect, receive, or process the following information depending on how you use it:</p>
        <ul>
          <li>Contact form fields, such as name, email address, company, subject, message, source page, and form timing metadata needed to process the request.</li>
          <li>Account or login data if you sign in, including session status, provider name, display name, email address where supplied, provider account ID, and avatar URL where supplied.</li>
          <li>Admin/session/security metadata where applicable, including whether an authenticated account is an admin, regular public account, or unauthenticated visitor.</li>
          <li>Page-visit and analytics events, including event ID, recorded time, page path, page URL, page title, referrer, timezone, browser, device, platform, and similar operational data.</li>
          <li>Request and infrastructure metadata, such as IP address at the request/security layer, user agent, host, origin, referrer, Cloudflare colo, and approximate city, region, or country where Cloudflare request metadata provides it.</li>
          <li>Cloudflare Turnstile and security challenge signals when a protected form uses Turnstile.</li>
          <li>Local storage, session storage, or cookies used for session state, security, UI state, browser behavior, or embedded third-party content.</li>
          <li>Admin-managed public assets and metadata, such as portfolio images, CV/project data, public media records, and published public site-data used to render the site.</li>
          <li>/watch page media platform data, such as public video titles, thumbnails, channel names, upload dates, livestream or broadcast metadata, embed URLs, and related public metadata.</li>
        </ul>
      </>
    ),
  },
  {
    id: "account-and-oauth-login",
    title: "Account and OAuth login",
    summary: "How login and admin access are handled.",
    children: (
      <>
        <p>
          The public account modal can start OAuth sign-in or signup with Google, GitHub, and X/Twitter
          through the DanielClancy-Admin auth origin. OAuth providers may supply profile or account
          data depending on the provider, consent screen, and provider configuration, such as provider
          subject ID, display name, email address, username, and avatar URL.
        </p>
        <p>
          Email/password admin login, where available, is handled server-side by the auth endpoint.
          The public browser does not verify admin passwords or receive provider secrets. Admin-only
          areas are restricted and are not general public account features.
        </p>
        <p>
          OAuth users are also subject to the applicable provider's terms, privacy policy, developer
          policies, security settings, and account controls. You can revoke connected access through
          your provider account/security settings.
        </p>
      </>
    ),
  },
  {
    id: "contact-forms-and-communications",
    title: "Contact forms and communications",
    summary: "How contact enquiries are processed.",
    children: (
      <>
        <p>
          The contact form asks for the details needed to respond to an enquiry, including name, email
          address, optional company, optional subject, and message text. The form also sends source
          path and timing fields used for validation and abuse prevention.
        </p>
        <p>
          Contact submissions are processed server-side through a Cloudflare Pages Function. Where
          configured, email delivery uses Resend, with the submitter email used as the reply-to value.
          Contact events may also be forwarded as event-only alerts or analytics records for
          operational visibility. Those events must not become alert rules or privileged state.
        </p>
        <p>
          The contact form uses a honeypot, timing checks, and Cloudflare Turnstile where configured.
          Turnstile verifies that the request is likely legitimate without requiring the site to run
          its own challenge infrastructure.
        </p>
      </>
    ),
  },
  {
    id: "watch-page-and-platform-api-data",
    title: "Watch page and platform API data",
    summary: "How /watch uses media provider data.",
    children: (
      <>
        <p>
          The /watch page currently uses a server-side YouTube feed to display the latest public
          channel release and recent uploads. The public browser receives normalized display data, not
          the server-side YouTube API key.
        </p>
        <p>
          Platform data may include video or livestream titles, thumbnails, channel names, stream
          status, scheduled/live/past broadcast metadata, publication times, embed URLs, video URLs,
          and related public metadata. This data is used to populate watch and media pages and to
          present current or past media content.
        </p>
        <p>
          If Twitch, Kick, or other streaming platform embeds or API-powered surfaces are added or
          used, DanielClancy.net should use only the public or consented data needed to present those
          media experiences. Platform data remains subject to each provider's own terms, privacy
          policies, and developer policies.
        </p>
      </>
    ),
  },
  {
    id: "youtube-api-services",
    title: "YouTube API Services",
    summary: "YouTube and Google-specific policy notices.",
    children: (
      <>
        <p>
          If YouTube API Services are used, that use is subject to YouTube and Google terms, privacy
          policies, and developer policies. DanielClancy.net uses YouTube data to display media/watch
          content and related metadata, such as video titles, thumbnails, channel details, upload
          dates, and embed/video URLs.
        </p>
        <p>
          DanielClancy.net does not sell YouTube API data. Users may revoke Google or YouTube API
          access through Google security settings where applicable.
        </p>
        <ul>
          <li><ExternalLink href="https://www.youtube.com/t/terms">YouTube Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://policies.google.com/privacy">Google Privacy Policy</ExternalLink></li>
          <li><ExternalLink href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</ExternalLink></li>
          <li><ExternalLink href="https://developers.google.com/youtube/terms/api-services-terms-of-service">YouTube API Services Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://developers.google.com/youtube/terms/developer-policies">YouTube API Services Developer Policies</ExternalLink></li>
          <li><ExternalLink href="https://security.google.com/settings/security/permissions">Google security permissions and revocation</ExternalLink></li>
        </ul>
      </>
    ),
  },
  {
    id: "twitch-kick-and-streaming-platform-data",
    title: "Twitch, Kick, and streaming platform data",
    summary: "How other livestream or embed providers may apply.",
    children: (
      <>
        <p>
          Streaming platform integrations or embeds may display public channel/feed information,
          livestream state, thumbnails, titles, channel names, profile links, scheduled stream details,
          and related metadata. DanielClancy.net should not claim broad account access unless a
          feature actually requests consented provider access.
        </p>
        <p>Provider terms and privacy notices may include:</p>
        <ul>
          <li><ExternalLink href="https://dev.twitch.tv/docs">Twitch Developer Documentation</ExternalLink></li>
          <li><ExternalLink href="https://www.twitch.tv/p/en/legal/terms-of-service/">Twitch Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://www.twitch.tv/p/en/legal/privacy-notice/">Twitch Privacy Notice</ExternalLink></li>
          <li><ExternalLink href="https://dev.kick.com/terms-of-service">Kick Developer Terms</ExternalLink></li>
          <li><ExternalLink href="https://kick.com/terms-of-service">Kick Terms of Service</ExternalLink></li>
        </ul>
      </>
    ),
  },
  {
    id: "github-google-and-x-oauth",
    title: "GitHub, Google, and X OAuth",
    summary: "Provider policy links for account login and developer services.",
    children: (
      <>
        <p>
          OAuth providers remain responsible for their own login screens, consent flows, account
          security controls, and provider-side data handling. DanielClancy.net uses OAuth responses
          only for account/session handling, admin boundary checks, and related security/account
          metadata.
        </p>
        <ul>
          <li><ExternalLink href="https://docs.github.com/site-policy/github-terms/github-terms-of-service">GitHub Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement">GitHub Privacy Statement</ExternalLink></li>
          <li><ExternalLink href="https://policies.google.com/privacy">Google Privacy Policy</ExternalLink></li>
          <li><ExternalLink href="https://policies.google.com/terms">Google Terms of Service</ExternalLink></li>
          <li><ExternalLink href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</ExternalLink></li>
          <li><ExternalLink href="https://docs.x.com/developer-terms/agreement">X Developer Agreement</ExternalLink></li>
          <li><ExternalLink href="https://docs.x.com/developer-terms/policy">X Developer Policy</ExternalLink></li>
          <li><ExternalLink href="https://x.com/en/privacy">X Privacy Policy</ExternalLink></li>
          <li><ExternalLink href="https://x.com/en/tos">X Terms of Service</ExternalLink></li>
        </ul>
      </>
    ),
  },
  {
    id: "analytics-page-visits-and-security-logs",
    title: "Analytics, page visits, and security logs",
    summary: "What operational analytics may include and why it is used.",
    children: (
      <>
        <p>
          DanielClancy.net sends page-visit events to a local public endpoint. That server-side
          endpoint may forward sanitized visit metadata to DanielClancy-Admin analytics and, where
          configured, StreamSuites event handling. The browser does not receive analytics ingest
          secrets.
        </p>
        <p>
          Analytics and security metadata can include page path, page URL, title, referrer, event ID,
          recorded time, browser, device, platform, timezone, country, region, city, Cloudflare colo,
          user agent, and IP address or request metadata at infrastructure/security layers. Location
          data is approximate and based on request metadata where available; the site does not collect
          sensitive exact GPS location for page-visit analytics.
        </p>
        <p>
          Analytics is used for operational understanding, security, abuse prevention, content
          performance, reliability, debugging, and alerting. Logs may be retained where needed for
          security or debugging, and retention should be limited to operational needs where practical.
        </p>
      </>
    ),
  },
  {
    id: "cloudflare-pages-turnstile-and-infrastructure",
    title: "Cloudflare Pages, Turnstile, and infrastructure",
    summary: "Cloudflare hosts, protects, and helps operate the public site.",
    children: (
      <>
        <p>
          DanielClancy.net is designed for Cloudflare Pages and may use Cloudflare Pages Functions,
          Workers-style request handling, KV, R2, cache, request metadata, and Turnstile security
          challenges. Cloudflare may process infrastructure and security metadata needed to deliver,
          protect, route, cache, and observe the service.
        </p>
        <p>Cloudflare policy links include:</p>
        <ul>
          <li><ExternalLink href="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy Policy</ExternalLink></li>
          <li><ExternalLink href="https://www.cloudflare.com/turnstile-privacy-policy/">Cloudflare Turnstile Privacy Addendum</ExternalLink></li>
          <li><ExternalLink href="https://www.cloudflare.com/website-terms/">Cloudflare Website Terms</ExternalLink></li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies-local-storage-and-similar-technologies",
    title: "Cookies, local storage, and similar technologies",
    summary: "Storage used by the site, auth providers, security tools, and embeds.",
    children: (
      <>
        <p>
          The site may use session cookies, authentication cookies, local storage, session storage, or
          similar browser technologies for account/session state, security, UI preferences, public UI
          state, analytics/beacon identifiers where actually present, and feature behavior.
        </p>
        <p>
          Cloudflare Turnstile may use security signals according to Cloudflare's policies. Third-party
          embeds, OAuth providers, payment providers, and media platforms may set their own cookies or
          storage when their content is loaded or their services are used.
        </p>
        <p>
          You can control many cookies and storage entries through your browser settings, although
          blocking some storage may affect login, forms, embeds, payment handoff, or security checks.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    summary: "The purposes for handling website and account information.",
    children: (
      <>
        <p>DanielClancy.net uses information to:</p>
        <ul>
          <li>Operate, maintain, secure, and improve the website.</li>
          <li>Respond to contact enquiries and professional communications.</li>
          <li>Provide login/session features and protect admin-only areas.</li>
          <li>Display portfolio, CV, project, media, /watch, and support content.</li>
          <li>Load public or consented provider/API content from services such as YouTube, GitHub, Google, X/Twitter, Twitch, Kick, Cloudflare, Resend, Stripe, PayPal, or other configured providers.</li>
          <li>Measure page visits, diagnose reliability, prevent abuse, debug errors, and understand content performance.</li>
          <li>Meet legal, security, operational, and compliance obligations where applicable.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-information-is-shared",
    title: "How information is shared",
    summary: "The limited cases where data may be sent to service providers or platforms.",
    children: (
      <>
        <p>
          Information may be shared with Cloudflare infrastructure, OAuth providers, media/API
          providers, email delivery providers such as Resend where configured, payment providers where
          payment features are used, DanielClancy-Admin analytics, StreamSuites event or analytics
          endpoints where configured, and other service providers needed to operate the site.
        </p>
        <p>
          Information may also be used or disclosed where reasonably necessary for legal compliance,
          security protection, fraud/abuse prevention, debugging, or protection of rights and site
          integrity. DanielClancy.net does not sell personal information or YouTube API data.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "Data retention",
    summary: "How long information may be kept.",
    children: (
      <>
        <p>
          Information is retained for as long as reasonably needed for the purpose it was collected,
          including responding to enquiries, keeping session/account records, protecting the site,
          meeting operational needs, diagnosing errors, preserving security logs, and complying with
          legal or accounting obligations where relevant.
        </p>
        <p>
          Public media/API data used for display may be cached or normalized for performance and
          reliability. If provider data changes or becomes unavailable, the site may show fallback
          states rather than pretending current data is available.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    summary: "Security practices used to protect the site and its integrations.",
    children: (
      <>
        <p>
          The site uses server-side handling for contact delivery, API keys, analytics forwarding,
          alert forwarding, and auth-origin communication where applicable. Secrets are not intended
          to be exposed in the public browser bundle.
        </p>
        <p>
          Security controls may include HTTPS, Cloudflare infrastructure, Turnstile, signed sessions,
          admin access checks, request validation, honeypots, timing checks, server-side logs, and
          provider-side security controls. No website can guarantee perfect security.
        </p>
      </>
    ),
  },
  {
    id: "international-processing",
    title: "International processing",
    summary: "Cloud and provider services may process information in multiple regions.",
    children: (
      <>
        <p>
          Daniel Clancy is based in Australia, and the site uses cloud and provider infrastructure
          that may process information in Australia, the United States, and other countries where
          Cloudflare, OAuth providers, media providers, email providers, payment providers, analytics
          services, or other service providers operate.
        </p>
        <p>
          Those countries may have privacy and data protection laws that differ from your location.
          Provider handling remains subject to each provider's own policies and legal obligations.
        </p>
      </>
    ),
  },
  {
    id: "your-choices-and-rights",
    title: "Your choices and rights",
    summary: "Ways to request access, correction, deletion, or other privacy action.",
    children: (
      <>
        <p>
          You can contact <a href="mailto:mail@danielclancy.net">mail@danielclancy.net</a> to request
          reasonable access, correction, deletion, or restriction of information associated with your
          website enquiry or account interaction.
        </p>
        <p>
          Some requests may be limited where information must be retained for security, legal,
          accounting, operational, fraud-prevention, or debugging reasons, or where the information is
          controlled by a third-party provider rather than DanielClancy.net.
        </p>
        <p>
          You can also use browser controls for cookies/local storage and provider account controls
          for OAuth, embedded media, payments, or platform-specific data.
        </p>
      </>
    ),
  },
  {
    id: "revoke-connected-access",
    title: "Revoke connected access",
    summary: "How to disconnect provider access where applicable.",
    children: (
      <>
        <p>
          You can revoke provider access through your provider account/security settings. Google and
          YouTube permissions can be reviewed through Google's security permissions page where
          applicable.
        </p>
        <ul>
          <li><ExternalLink href="https://security.google.com/settings/security/permissions">Google security permissions and revocation</ExternalLink></li>
          <li><ExternalLink href="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement">GitHub Privacy Statement</ExternalLink></li>
          <li><ExternalLink href="https://x.com/en/privacy">X Privacy Policy</ExternalLink></li>
        </ul>
        <p>
          Revoking provider access may not automatically delete historical server-side records that
          are kept for legitimate operational, legal, security, or audit reasons.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    summary: "The site is not directed at children.",
    children: (
      <>
        <p>
          DanielClancy.net is a professional portfolio, CV, contact, and media website. It is not
          directed to children, and it is not designed to knowingly collect personal information from
          children.
        </p>
        <p>
          If you believe a child has provided personal information through the site, contact
          <a href="mailto:mail@danielclancy.net"> mail@danielclancy.net</a> so the issue can be
          reviewed.
        </p>
      </>
    ),
  },
  {
    id: "third-party-links-and-embedded-content",
    title: "Third-party links and embedded content",
    summary: "External links, embeds, and provider content are governed by their own policies.",
    children: (
      <>
        <p>
          DanielClancy.net may link to or embed third-party content, including YouTube videos, social
          platforms, payment providers, portfolio references, employer/client/project references, maps,
          and other websites. Those third parties may collect information directly from you when you
          interact with their services.
        </p>
        <p>
          The presence of a link, logo, platform name, embed, or provider integration does not mean
          DanielClancy.net controls that third party's service, policies, content, availability, or
          data practices.
        </p>
      </>
    ),
  },
  {
    id: "changes-to-this-policy",
    title: "Changes to this policy",
    summary: "How updates will be shown.",
    children: (
      <>
        <p>
          This policy may be updated as the website, provider integrations, analytics, account
          features, or legal requirements change. The page will show a last-updated date when the
          policy is revised.
        </p>
        <p>
          Continued use of the site after an update means the revised policy applies from the updated
          date, unless a mandatory law requires a different process.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    summary: "Where to send privacy questions or requests.",
    children: (
      <>
        <p>
          For privacy questions, account/provider concerns, correction requests, or website policy
          enquiries, contact <a href="mailto:mail@danielclancy.net">mail@danielclancy.net</a>.
        </p>
        <p>
          Please include enough context to identify the relevant interaction, such as the page URL,
          approximate date, contact form email address, or provider account used. Do not send
          passwords, API keys, OAuth secrets, or other sensitive credentials by email.
        </p>
      </>
    ),
  },
];

export function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How DanielClancy.net collects, uses, protects, and shares information when you use the website, account features, contact forms, analytics, media integrations, and related services."
      description="Privacy Policy for DanielClancy.net covering contact forms, login/OAuth, analytics, media API integrations, Cloudflare, Turnstile, and third-party services."
      path="/privacy"
      lastUpdated={lastUpdated}
      sections={privacySections}
    />
  );
}
