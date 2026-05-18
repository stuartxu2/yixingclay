/** The PO/ET wordmark — slash always carries the clay accent. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      PO<span className="font-light text-clay">/</span>ET
    </span>
  );
}
