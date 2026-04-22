import { socialIcons } from "../content/brandAssets";

const socialLinks = [
  {
    label: "Rumble",
    href: "https://rumble.com/DanielClancy",
    icon: socialIcons.rumble,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@danielclancy",
    icon: socialIcons.youtube,
  },
  {
    label: "Twitter(X)",
    href: "https://x.com/danielclancy",
    icon: socialIcons.x,
  },
  {
    label: "StreamSuites",
    href: "https://streamsuites.app/@danielclancy",
    icon: socialIcons.streamSuites,
  },
  {
    label: "GitHub",
    href: "https://github.com/bsmediagroup",
    icon: socialIcons.github,
  },
];

type SocialLinkRowProps = {
  className?: string;
};

export function SocialLinkRow({ className = "" }: SocialLinkRowProps) {
  return (
    <div className={`social-link-row ${className}`.trim()} aria-label="Daniel Clancy external links">
      {socialLinks.map((link) => (
        <a
          key={link.label}
          className="social-link-row__item"
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`${link.label} (opens in a new tab)`}
        >
          <span className="social-link-row__icon">
            <img alt="" src={link.icon} />
          </span>
          <span className="social-link-row__label">{link.label}</span>
          <span className="social-link-row__external" aria-hidden="true">
            ↗
          </span>
        </a>
      ))}
    </div>
  );
}
