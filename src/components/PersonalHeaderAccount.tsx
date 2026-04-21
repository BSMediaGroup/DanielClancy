import { shellAssets } from "../content/brandAssets";

export function PersonalHeaderAccount() {
  return (
    <details className="account-menu">
      <summary className="account-menu__trigger">
        <span className="account-menu__bell" aria-hidden="true">
          •
        </span>
        <span className="account-menu__avatar">
          <img alt="" src={shellAssets.profileAvatar} />
        </span>
        <span className="account-menu__label">Daniel Clancy</span>
        <span className="account-menu__caret" aria-hidden="true">
          ▾
        </span>
      </summary>

      <div className="account-menu__panel">
        <div className="account-menu__meta">
          <span>Member access</span>
          <strong>Studio journal preview</strong>
        </div>
        <div className="account-menu__actions">
          <button className="button button--secondary" type="button">
            Sign in
          </button>
          <button className="button button--ghost" type="button">
            Join waitlist
          </button>
        </div>
      </div>
    </details>
  );
}
