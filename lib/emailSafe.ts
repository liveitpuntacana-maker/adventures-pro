/**
 * Helpers for putting visitor-typed text into an email.
 *
 * The forms send whatever the visitor typed to the company inbox, so the text is
 * untrusted: HTML in a name would render inside the staff member's mail client,
 * and a line break in a "subject" is how extra headers get injected.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Collapses line breaks and control characters, then caps the length. */
export function oneLine(value: string, max: number): string {
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
