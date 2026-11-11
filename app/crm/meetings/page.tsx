import Link from "next/link";
import { requireArea } from "@/lib/crm/auth";
import { listMeetings, meetingCounts, meetingsVersion, MEETING_STATUSES, MEETING_STATUS_LABEL, syncMeetings, type SyncResult } from "@/lib/crm/calendly";
import MeetingsView from "@/components/crm/MeetingsView";
import { PageHead, Pager } from "@/components/crm/ListTools";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; status?: string; when?: string; page?: string }> };

export default async function MeetingsPage({ searchParams }: Props) {
  await requireArea("leads");
  const sp = await searchParams;
  const f = {
    q: sp.q || "",
    status: (MEETING_STATUSES as readonly string[]).includes(sp.status || "") ? (sp.status as string) : "",
    when: sp.when === "upcoming" || sp.when === "past" ? sp.when : "",
  };
  // bring in what changed in Calendly first (never wait on Calendly for long)
  const sync: SyncResult = await Promise.race([
    syncMeetings({ maxAgeMs: 5_000 }),
    new Promise<SyncResult>((r) => setTimeout(() => r({ ok: true, configured: true }), 7000)),
  ]);
  const [data, version, counts] = await Promise.all([listMeetings({ ...f, page: Number(sp.page) || 1 }), meetingsVersion().catch(() => ""), meetingCounts()]);
  const chipHref = (status: string) => {
    const q = new URLSearchParams();
    if (f.q) q.set("q", f.q);
    if (f.when) q.set("when", f.when);
    if (status) q.set("status", status);
    const s = q.toString();
    return s ? `?${s}` : "?";
  };
  const filtered = Boolean(f.q || f.status || f.when);

  return (
    <>
      <PageHead
        title="Calendly Meetings"
        sub="Meetings booked through the website and Calendly. Arrange, reschedule, edit, and cancel meetings directly with two-way Calendly & CRM synchronization."
      >
        <a href={`/api/crm/meetings/export${filtered ? `?${new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString()}` : ""}`} className="crm-act crm-act-ghost">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV
        </a>
      </PageHead>

      {!sync.configured && (
        <p className="crm-alert crm-meet-note" role="status">
          Calendly personal access token not configured in <code>CALENDLY_TOKEN</code>. Real-time website bookings and local CRM meeting management work automatically. To enable direct Calendly API cancellations and single-use link generation, add your Calendly token to <code>.env.local</code>.
        </p>
      )}
      {sync.configured && !sync.ok && (
        <p className="crm-alert crm-meet-note" role="status">
          Couldn&apos;t reach Calendly just now, so the list may be a little behind. It will try again in a minute.
        </p>
      )}

      <nav className="crm-meet-chips" aria-label="Meeting status">
        {[["", "All", counts.total], ...MEETING_STATUSES.map((k) => [k, MEETING_STATUS_LABEL[k], counts[k]])].map(([k, label, n]) => (
          <Link key={String(k)} href={chipHref(String(k))} className={`crm-meet-chip${f.status === k ? " is-on" : ""}`} aria-current={f.status === k ? "page" : undefined}>
            {label}
            <span className="crm-meet-chip-n">{n}</span>
          </Link>
        ))}
      </nav>

      <form className="crm-filters" method="get">
        <label className="crm-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input className="crm-input" type="search" name="q" defaultValue={f.q} placeholder="Search name, email or meeting" aria-label="Search" />
        </label>
        <select className="crm-input crm-select" name="when" defaultValue={f.when} aria-label="When">
          <option value="">All meetings</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
        <select className="crm-input crm-select" name="status" defaultValue={f.status} aria-label="Status">
          <option value="">All statuses</option>
          {MEETING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {MEETING_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="crm-act crm-act-dark">
          Apply
        </button>
        {filtered && (
          <Link href="?" className="crm-act crm-act-ghost">
            Clear
          </Link>
        )}
      </form>

      <div className="crm-card crm-card-flush">
        <MeetingsView rows={data.items} version={version} live={sync.configured} />
        <Pager {...data} q={f.q} status={f.status} extra={{ when: f.when }} />
      </div>
    </>
  );
}
