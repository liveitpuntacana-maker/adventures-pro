"use client";

type ScrollToAnchorButtonProps = {
  targetId: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Scrolls to a section on the same page without ever touching the URL —
 * a plain `<a href="#...">` would leave a "#section" fragment in the address
 * bar, which reads as unpolished on a page meant to look professional.
 */
export default function ScrollToAnchorButton({
  targetId,
  className,
  children,
}: ScrollToAnchorButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </button>
  );
}
