# NOTES.md — Comparing Hand-Built Components to shadcn/ui

## What I built
Three components in `playground/` — a Modal dialog, Tabs, and a Disclosure — implemented directly against their W3C ARIA Authoring Practices patterns, with no component library. All three were tested keyboard-only (Tab, Shift+Tab, Escape, Arrow keys, Home/End where applicable).

## What shadcn/ui actually is
Before comparing, one thing became clear reading the source: **shadcn/ui's Dialog and Tabs are not custom accessibility implementations at all — they are thin styling wrappers around Radix UI primitives** (`@radix-ui/react-dialog` and the `radix-ui` package's `Tabs`). shadcn's own `dialog.tsx` is essentially:

```tsx
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogContent = React.forwardRef<...>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cn("...", className)} {...props}>
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
```

All of the actual ARIA behavior (roles, focus trap, keyboard handling, focus return) is implemented inside Radix's `DialogPrimitive`, not in shadcn's file. shadcn adds `data-slot` attributes, Tailwind utility classes, and `cva` style variants — nothing more. Same story for Tabs: `TabsPrimitive.Root`/`List`/`Trigger`/`Content` from Radix do all the roving-tabindex and arrow-key logic; shadcn's `tabs.tsx` only adds styling on top.

This reframes the comparison: it's really "my hand-rolled ARIA logic vs. Radix's battle-tested ARIA logic," with shadcn contributing the visual layer on top of Radix either way.

## Concrete gaps between my version and shadcn's (Radix's)

1. **Body scroll locking.** My Modal has a working focus trap, but I never lock scrolling on the page behind it — a keyboard or screen reader user can still scroll the background content while the dialog is open, which is confusing and is called out in the APG dialog pattern's expected behavior. Radix's `Dialog.Root` locks body scroll automatically while the dialog is open. This is a real functional gap I missed, not just a styling difference.

2. **`aria-describedby` / a linked description.** My Modal only wires up `aria-labelledby` (pointing to the title). It has no equivalent of Radix's `DialogDescription`, which automatically generates and links a second id via `aria-describedby` so screen reader users hear both a label and a description when the dialog opens. My version relies entirely on visually-present body text with no structured relationship to the dialog element itself — a real, name-able accessibility gap, not a nitpick.

3. **Activation mode flexibility in Tabs.** My Tabs implementation hard-codes "automatic activation" (arrow keys immediately select the tab) and horizontal orientation only. Radix's Tabs primitive exposes an `activationMode` prop (`automatic` vs `manual`) and an `orientation` prop that changes both the visual layout and which arrow keys are active (Up/Down instead of Left/Right for vertical tabs) — configurable without rewriting the keyboard handler. Mine would need real code changes to support either variant.

4. **Focus-trap robustness.** My focus trap in `Modal.tsx` queries `querySelectorAll` for focusable elements once whenever Tab is pressed, which works for a static dialog body but wouldn't correctly handle focusable elements that are added, removed, or become disabled *while the dialog is open* (e.g. a button that becomes enabled after some async state change). Radix uses a dedicated `FocusScope` primitive designed to handle exactly these dynamic cases.

## What I got right
Comparing role/attribute usage side by side, my components matched the APG pattern closely on the fundamentals: correct `role="dialog"` + `aria-modal="true"` + `aria-labelledby` on the Modal, correct `role="tablist"`/`"tab"`/`"tabpanel"` triad with `aria-selected` and roving `tabindex` on Tabs, and correct `aria-expanded`/`aria-controls` plus a native `<button>` trigger on the Disclosure (which meant Enter/Space activation came for free from the browser, no custom key handling needed). Escape-to-close and focus-return-to-trigger on the Modal both worked correctly when tested keyboard-only.

## Takeaway
Building these by hand made the "gaps" list above genuinely mine to notice — I wouldn't have known to check for body-scroll locking or thought about dynamic focus-trap edge cases if I'd started from a working library and never had to write the trap logic myself. The exercise also reframed what "using shadcn" really means: you're not getting shadcn's accessibility logic, you're getting Radix's, with shadcn as a styling layer on top — which matters for reviewing AI-generated code that imports shadcn, since the actual correctness guarantee comes from Radix, not from shadcn's own file.
