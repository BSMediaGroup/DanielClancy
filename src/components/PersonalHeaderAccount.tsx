import { shellAssets } from "../content/brandAssets";

type AccountState =
  | {
      isLoggedIn: false;
    }
  | {
      isLoggedIn: true;
      username: string;
      avatarSrc?: string | null;
    };

function getAccountState(): AccountState {
  return { isLoggedIn: false };
}

export function PersonalHeaderAccount() {
  const account = getAccountState();
  const usesIconAvatar = !account.isLoggedIn || !account.avatarSrc;
  const avatarSrc = account.isLoggedIn
    ? account.avatarSrc || shellAssets.profileIcon
    : shellAssets.keyIcon;

  return (
    <details className="account-menu">
      <summary
        aria-label={account.isLoggedIn ? `Open account menu for ${account.username}` : "Open personal studio account menu"}
        className="account-menu__trigger"
      >
        <span className="account-menu__avatar">
          <img
            alt=""
            className={usesIconAvatar ? "account-menu__avatar-image account-menu__avatar-image--icon" : "account-menu__avatar-image"}
            src={avatarSrc}
          />
        </span>
        {account.isLoggedIn ? <span className="account-menu__label">{account.username}</span> : null}
      </summary>

      <div className="account-menu__panel">
        <div className="account-menu__meta">
          <span>{account.isLoggedIn ? "Account" : "Account preview"}</span>
          <strong>{account.isLoggedIn ? account.username : "Personal studio access"}</strong>
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
