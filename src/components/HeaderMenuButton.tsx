type HeaderMenuButtonProps = {
  controls: string;
  isOpen: boolean;
  onToggle: () => void;
};

export function HeaderMenuButton({ controls, isOpen, onToggle }: HeaderMenuButtonProps) {
  return (
    <button
      aria-controls={controls}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      className={`mobile-nav-toggle${isOpen ? " mobile-nav-toggle--open" : ""}`}
      type="button"
      onClick={onToggle}
    >
      <span className="mobile-nav-toggle__line" />
      <span className="mobile-nav-toggle__line" />
      <span className="mobile-nav-toggle__line" />
    </button>
  );
}
