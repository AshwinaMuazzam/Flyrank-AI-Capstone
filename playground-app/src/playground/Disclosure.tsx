import { useState, type ReactNode } from 'react';

interface DisclosureProps {
  id: string;
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/**
 * Disclosure implementing the W3C ARIA Authoring Practices "Disclosure (Show/Hide)" pattern.
 * https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 *
 * Key behaviors implemented:
 * - A native <button> triggers the disclosure, so Enter/Space activation and
 *   keyboard focus come for free from the browser (no custom key handling needed).
 * - aria-expanded reflects open/closed state on the trigger button.
 * - aria-controls links the trigger to the content region it reveals.
 * - Content is only rendered in the accessibility tree / tab order when open
 *   (using `hidden`, not just CSS display), so hidden content can't be Tabbed into.
 */
export default function Disclosure({ id, summary, children, defaultOpen = false }: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = `disclosure-content-${id}`;

  return (
    <div className="disclosure">
      <button
        type="button"
        className="disclosure__trigger"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={`disclosure__icon ${isOpen ? 'is-open' : ''}`} aria-hidden="true">
          ▶
        </span>
        {summary}
      </button>
      <div id={contentId} className="disclosure__content" hidden={!isOpen}>
        {children}
      </div>
    </div>
  );
}
