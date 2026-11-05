import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { listMeetings, meetingsVersion, MEETING_STATUSES, MEETING_STATUS_LABEL, syncMeetings, type SyncResult } from "@/lib/crm/calendly";
import MeetingsView from "@/components/crm/MeetingsView";
import { PageHead, Pager } from "@/components/crm/ListTools";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; status?: string; when?: string; page?: string }> };

export default async function MeetingsPage({ searchParams }: Props) {
  await requireUser();
  const sp = await searchParams;
  const f = {
    q: sp.q || "",
    status: (MEETING_STATUSES as readonly string[]).includes(sp.status || "") ? (sp.status as string) : "",
    when: sp.when === "upcoming" || sp.when === "past" ? sp.when : "",
  };
  // bring in what changed in Calendly first (never wait on Calendly for long)
  const sync: SyncResult = await Promise.race([
    syncMeetings(),
    new Promise<SyncResult>((r) => setTimeout(() => r({ ok: true, configured: true }), 7000)),
  ]);
  const [data, version] = await Promise.all([listMeetings({ ...f, page: Number(sp.page) || 1 }), meetingsVersion().catch(() => "")]);
  const filtered = Boolean(f.q || f.status || f.when);

  return (
    <>
      <PageHead
        title="Calendly Meetings"
        sub="Meetings booked through the website's Calendly. Reschedules and cancellations made in Calendly show up here by themselves. View only: meetings are changed in Calendly."
      />

      {!sync.configured && (
        <p className="crm-alert crm-meet-note" role="status">
          Calendly isn&apos;t connected yet. Add your Calendly personal access token as <code>CALENDLY_TOKEN</code> in the website&apos;s settings and restart the site; meetings will then appear here.
        </p>
      )}
      {sync.configured && !sync.ok && (
        <p className="crm-alert crm-meet-note" role="status">
          Couldn&apos;t reach Calendly just now, so the list may be a little behind. It will try again in a minute.
        </p>
      )}

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
