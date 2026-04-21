import { shellAssets, socialIcons } from "../content/brandAssets";

export function PersonalProfileWidget() {
  return (
    <aside className="profile-widget" aria-label="Member access preview">
      <div className="profile-widget__cover" aria-hidden="true" />
      <div className="profile-widget__body">
        <div className="profile-widget__avatar">
          <img alt="" src={shellAssets.profileAvatar} />
        </div>

        <div className="profile-widget__identity">
          <div>
            <p className="kicker">Member access</p>
            <h2>Studio channel pass</h2>
          </div>
          <span className="status-pill">Preview</span>
        </div>

        <p className="profile-widget__summary">
          Future sign-in, memberships, and supporter perks will land here without changing the
          personal shell layout.
        </p>

        <div className="profile-widget__socials" aria-hidden="true">
          <span><img alt="" src={socialIcons.youtube} /></span>
          <span><img alt="" src={socialIcons.rumble} /></span>
          <span><img alt="" src={socialIcons.locals} /></span>
        </div>

        <div className="profile-widget__actions">
          <button className="button button--secondary" type="button">
            Sign in
          </button>
          <button className="button button--ghost" type="button">
            Join waitlist
          </button>
        </div>
      </div>
    </aside>
  );
}
