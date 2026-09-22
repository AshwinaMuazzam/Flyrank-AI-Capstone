import { useEffect, useRef, type ReactNode, type KeyboardEvent } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  children: ReactNode;
  /** The element that opened the modal, so focus can return to it on close. */
  triggerRef: React.RefObject<HTMLElement | null>;
}

/**
 * Modal dialog implementing the W3C ARIA Authoring Practices "Dialog (Modal)" pattern.
 * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 *
 * Key behaviors implemented:
 * - role="dialog" + aria-modal="true" + aria-labelledby
 * - Focus moves into the dialog when it opens (to the first focusable element)
 * - Tab/Shift+Tab is trapped within the dialog while open (focus cannot escape to the page behind it)
 * - Escape closes the dialog
 * - Focus returns to the triggering element when the dialog closes
 */
export default function Modal({ isOpen, onClose, titleId, title, children, triggerRef }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog when it opens; return focus to the trigger when it closes.
  useEffect(() => {
    if (isOpen) {
      const focusable = getFocusableElements(dialogRef.current);
      (focusable[0] ?? dialogRef.current)?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen, triggerRef]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Trap focus: wrap from last -> first (Tab) and first -> last (Shift+Tab).
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <h2 id={titleId} className="modal-title">
          {title}
        </h2>
        <div className="modal-body">{children}</div>
        <button type="button" className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

/**
 * Returns all focusable elements within a container, in DOM order.
 * Used to determine the first/last tab stops for the focus trap.
 */
function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}
