import Link from "next/link";

/* Search + status filter (a plain GET form, so the URL holds the filters) */
export function Filters({
  q,
  status,
  statuses,
  placeholder,
}: {
  q: string;
  status: string;
  statuses: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <form className="crm-filters" method="get">
      <label className="crm-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input className="crm-input" type="search" name="q" defaultValue={q} placeholder={placeholder} aria-label="Search" />
      </label>
      <select className="crm-input crm-select" name="status" defaultValue={status} aria-label="Status">
        <option value="">All statuses</option>
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button type="submit" className="crm-act crm-act-dark">
        Apply
      </button>
      {(q || status) && (
        <Link href="?" className="crm-act crm-act-ghost">
          Clear
        </Link>
      )}
    </form>
  );
}

/* Page links that keep the current filters */
export function Pager({ page, pages, total, pageSize, q, status }: { page: number; pages: number; total: number; pageSize: number; q: string; status: string }) {
  if (total === 0) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `?${s}` : "?";
  };
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="crm-pager">
      <span className="crm-muted">
        {from}–{to} of {total}
      </span>
      <span className="crm-pager-links">
        {page > 1 ? (
          <Link href={href(page - 1)} className="crm-act crm-act-ghost crm-act-sm">
            Previous
          </Link>
        ) : (
          <span className="crm-act crm-act-ghost crm-act-sm is-disabled">Previous</span>
        )}
        <span className="crm-muted">
          Page {page} of {pages}
        </span>
        {page < pages ? (
          <Link href={href(page + 1)} className="crm-act crm-act-ghost crm-act-sm">
            Next
          </Link>
        ) : (
          <span className="crm-act crm-act-ghost crm-act-sm is-disabled">Next</span>
        )}
      </span>
    </div>
  );
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="crm-head">
      <div>
        <h1 className="crm-title">{title}</h1>
        {sub && <p className="crm-sub">{sub}</p>}
      </div>
      {children && <div className="crm-head-actions">{children}</div>}
    </div>
  );
}
