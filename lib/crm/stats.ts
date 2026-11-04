import "server-only";
import { getPool } from "@/lib/db";
import { SOURCES } from "@/lib/crm/data";
import { ENQUIRY_STATUSES, PROJECT_STATUSES, type EnquirySource } from "@/lib/crm/leadOptions";
import { APPLICATION_STATUSES } from "@/lib/applications";

/*
 * Numbers for the two CRM dashboards: the Payments overview (payments only)
 * and the main Dashboard (the whole CRM). Every query is guarded so a missing
 * table or column on an older database shows zeros instead of an error page.
 */

type Row = Record<string, unknown>;

async function q(sql: string, args: unknown[] = []): Promise<Row[]> {
  try {
    const [rows] = await getPool().query(sql, args);
    return rows as Row[];
  } catch {
    return [];
  }
}

const n = (v: unknown) => Number(v || 0);

/** The last `count` months, oldest first: { key: "2026-06", label: "Jun" } */
export function lastMonths(count = 6) {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return out;
}

/* ---------------------------------------------------------------------------
   Payments
   Website checkout payments (payments, source website/online) and payment
   links (payment_links) — the same records the Payments list shows.
   amount = received so far, total_amount = invoice total,
   remaining_amount = balance still due.
   --------------------------------------------------------------------------- */
const PAY_SET = `
  SELECT 'website' AS kind, amount, total_amount, remaining_amount, currency, method, status, service,
         link_status, expires_at, paid_at, created_at, balance_due_date, client_name, invoice_number, id
    FROM payments WHERE source IN ('website', 'online')
  UNION ALL
  SELECT 'link' AS kind, amount, total_amount, remaining_amount, currency, method, status, service,
         link_status, expires_at, paid_at, created_at, balance_due_date, client_name, invoice_number, id
    FROM payment_links`;

const PAY_WEBSITE_ONLY = `
  SELECT 'website' AS kind, amount, total_amount, remaining_amount, currency, method, status, service,
         link_status, expires_at, paid_at, created_at, balance_due_date, client_name, invoice_number, id
    FROM payments WHERE source IN ('website', 'online')`;

const RECEIVED = `CASE WHEN p.status IN ('paid','partially_paid') THEN p.amount ELSE 0 END`;
const DUE = `CASE WHEN p.status IN ('pending','partially_paid')
                  THEN COALESCE(NULLIF(p.remaining_amount, 0), CASE WHEN p.status = 'pending' THEN COALESCE(NULLIF(p.total_amount, 0), p.amount) ELSE 0 END, 0)
                  ELSE 0 END`;

export type PaymentStats = Awaited<ReturnType<typeof paymentStats>>;

export async function paymentStats() {
  // fall back to website payments alone if payment_links is missing
  let set = PAY_SET;
  const probe = await q(`SELECT COUNT(*) AS c FROM (${set}) p`);
  if (!probe.length) set = PAY_WEBSITE_ONLY;

  // the main currency is the one most records use; totals are shown in it
  const byCurrency = (
    await q(
      `SELECT p.currency, COUNT(*) AS c, SUM(${RECEIVED}) AS received, SUM(${DUE}) AS due
         FROM (${set}) p GROUP BY p.currency ORDER BY c DESC`
    )
  ).map((r) => ({ currency: String(r.currency || "USD"), count: n(r.c), received: n(r.received), due: n(r.due) }));
  const currency = byCurrency[0]?.currency || "USD";
  const inCur = `FROM (${set}) p WHERE p.currency = ?`;

  const [totals] = await q(
    `SELECT COUNT(*) AS c,
            SUM(${RECEIVED}) AS received,
            SUM(CASE WHEN p.status IN ('paid','partially_paid') AND COALESCE(p.paid_at, p.created_at) >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN p.amount ELSE 0 END) AS month,
            SUM(CASE WHEN p.status IN ('paid','partially_paid') AND COALESCE(p.paid_at, p.created_at) >= DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01')
                      AND COALESCE(p.paid_at, p.created_at) < DATE_FORMAT(NOW(), '%Y-%m-01') THEN p.amount ELSE 0 END) AS last_month,
            SUM(${DUE}) AS due,
            SUM(CASE WHEN p.status IN ('pending','partially_paid') THEN 1 ELSE 0 END) AS open_count,
            SUM(CASE WHEN p.status NOT IN ('failed','refunded') THEN COALESCE(NULLIF(p.total_amount, 0), p.amount) ELSE 0 END) AS invoiced,
            SUM(CASE WHEN p.status = 'refunded' THEN p.amount ELSE 0 END) AS refunded,
            SUM(CASE WHEN p.status IN ('paid','partially_paid') THEN 1 ELSE 0 END) AS paid_count
       ${inCur}`,
    [currency]
  );

  const statusRows = await q(`SELECT p.status, COUNT(*) AS c, SUM(COALESCE(NULLIF(p.total_amount, 0), p.amount)) AS v ${inCur} GROUP BY p.status`, [currency]);
  const byStatus = ["paid", "partially_paid", "pending", "failed", "refunded"].map((s) => {
    const r = statusRows.find((x) => x.status === s);
    return { status: s, count: n(r?.c), value: n(r?.v) };
  });

  const months = lastMonths(6);
  const trendRows = await q(
    `SELECT DATE_FORMAT(COALESCE(p.paid_at, p.created_at), '%Y-%m') AS m, SUM(p.amount) AS v, COUNT(*) AS c
       ${inCur} AND p.status IN ('paid','partially_paid') AND COALESCE(p.paid_at, p.created_at) >= ?
       GROUP BY m`,
    [currency, `${months[0].key}-01`]
  );
  const trend = months.map((m) => {
    const r = trendRows.find((x) => x.m === m.key);
    return { ...m, value: n(r?.v), count: n(r?.c) };
  });

  const byMethod = (
    await q(`SELECT COALESCE(NULLIF(p.method, ''), 'Other') AS k, COUNT(*) AS c, SUM(${RECEIVED}) AS v ${inCur} GROUP BY k ORDER BY v DESC, c DESC LIMIT 6`, [currency])
  ).map((r) => ({ label: String(r.k), count: n(r.c), value: n(r.v) }));

  const byService = (
    await q(
      `SELECT COALESCE(NULLIF(p.service, ''), 'Not specified') AS k, COUNT(*) AS c, SUM(${RECEIVED}) AS v
         ${inCur} GROUP BY k ORDER BY v DESC, c DESC LIMIT 6`,
      [currency]
    )
  ).map((r) => ({ label: String(r.k), count: n(r.c), value: n(r.v) }));

  const kindRows = await q(`SELECT p.kind, COUNT(*) AS c, SUM(${RECEIVED}) AS v ${inCur} GROUP BY p.kind`, [currency]);
  const byChannel = {
    website: { count: n(kindRows.find((r) => r.kind === "website")?.c), value: n(kindRows.find((r) => r.kind === "website")?.v) },
    link: { count: n(kindRows.find((r) => r.kind === "link")?.c), value: n(kindRows.find((r) => r.kind === "link")?.v) },
  };

  const [links] = await q(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN link_status = 'active' AND status IN ('pending','partially_paid') AND (expires_at IS NULL OR expires_at > NOW()) THEN 1 ELSE 0 END) AS active,
            SUM(CASE WHEN status IN ('paid','partially_paid') THEN 1 ELSE 0 END) AS paid,
            SUM(CASE WHEN link_status = 'expired' OR (status = 'pending' AND expires_at IS NOT NULL AND expires_at <= NOW()) THEN 1 ELSE 0 END) AS expired,
            SUM(CASE WHEN link_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
       FROM payment_links`
  );

  const dueSoon = (
    await q(
      `SELECT p.kind, p.id, p.client_name, p.invoice_number, p.service, p.balance_due_date, ${DUE} AS due
         ${inCur} AND p.status IN ('pending','partially_paid')
         ORDER BY p.balance_due_date IS NULL, p.balance_due_date ASC, p.created_at DESC LIMIT 5`,
      [currency]
    )
  ).map((r) => ({
    key: `${r.kind}-${r.id}`,
    client: String(r.client_name || "—"),
    invoice: r.invoice_number ? String(r.invoice_number) : null,
    service: r.service ? String(r.service) : null,
    dueDate: r.balance_due_date ? new Date(r.balance_due_date as string).toISOString() : null,
    due: n(r.due),
  }));

  const recent = (
    await q(
      `SELECT p.kind, p.id, p.client_name, p.service, p.status, p.amount, p.total_amount, p.remaining_amount, p.paid_at, p.created_at
         ${inCur} ORDER BY COALESCE(p.paid_at, p.created_at) DESC, p.created_at DESC LIMIT 5`,
      [currency]
    )
  ).map((r) => ({
    key: `${r.kind}-${r.id}`,
    kind: r.kind === "link" ? ("link" as const) : ("website" as const),
    client: String(r.client_name || "—"),
    service: r.service ? String(r.service) : null,
    status: String(r.status || "pending"),
    amount: n(r.status === "pending" ? r.total_amount || r.amount : r.amount),
    at: new Date((r.paid_at || r.created_at) as string).toISOString(),
  }));

  const received = n(totals?.received);
  const invoiced = n(totals?.invoiced);
  return {
    currency,
    byCurrency,
    count: n(totals?.c),
    received,
    month: n(totals?.month),
    lastMonth: n(totals?.last_month),
    due: n(totals?.due),
    openCount: n(totals?.open_count),
    paidCount: n(totals?.paid_count),
    invoiced,
    refunded: n(totals?.refunded),
    collectionRate: invoiced > 0 ? Math.round((received / invoiced) * 100) : 0,
    byStatus,
    trend,
    byMethod,
    byService,
    byChannel,
    links: {
      total: n(links?.total),
      active: n(links?.active),
      paid: n(links?.paid),
      expired: n(links?.expired),
      cancelled: n(links?.cancelled),
    },
    dueSoon,
    recent,
  };
}

/* ---------------------------------------------------------------------------
   Whole CRM
   --------------------------------------------------------------------------- */
export async function crmOverview() {
  const keys = Object.keys(SOURCES) as EnquirySource[];
  const months = lastMonths(6);
  const since = `${months[0].key}-01`;

  const perSource = await Promise.all(
    keys.map(async (key) => {
      const [r] = await q(
        `SELECT COUNT(*) AS total, SUM(status = 'new') AS fresh,
                SUM(created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) AS month,
                SUM(created_at >= NOW() - INTERVAL 7 DAY) AS week
           FROM \`${SOURCES[key].table}\``
      );
      return { key, label: SOURCES[key].short, href: SOURCES[key].href, total: n(r?.total), fresh: n(r?.fresh), month: n(r?.month), week: n(r?.week) };
    })
  );

  // one union of every lead table for status / project / trend counts
  const unionWithProject = keys.map((k) => `SELECT status, project_status, created_at, '${k}' AS src FROM \`${SOURCES[k].table}\``).join(" UNION ALL ");
  const unionBasic = keys.map((k) => `SELECT status, 'Not Started' AS project_status, created_at, '${k}' AS src FROM \`${SOURCES[k].table}\``).join(" UNION ALL ");
  let leads = unionWithProject;
  if (!(await q(`SELECT COUNT(*) AS c FROM (${leads}) l`)).length) leads = unionBasic;

  const statusRows = await q(`SELECT status, COUNT(*) AS c FROM (${leads}) l GROUP BY status`);
  const byStatus = ENQUIRY_STATUSES.map((s) => ({ status: s, count: n(statusRows.find((r) => r.status === s)?.c) }));

  const projectRows = await q(`SELECT project_status AS s, COUNT(*) AS c FROM (${leads}) l GROUP BY project_status`);
  const byProject = PROJECT_STATUSES.map((s) => ({ status: s, count: n(projectRows.find((r) => r.s === s)?.c) }));

  const trendRows = await q(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS m, COUNT(*) AS c FROM (${leads}) l WHERE created_at >= ? GROUP BY m`,
    [since]
  );
  const leadTrend = months.map((m) => ({ ...m, value: n(trendRows.find((r) => r.m === m.key)?.c) }));

  // lead channel: website forms are "Website"; manual leads carry their own channel
  const channelRows = await q(`SELECT COALESCE(NULLIF(lead_channel, ''), 'Manual') AS ch, COUNT(*) AS c FROM manual_leads GROUP BY ch`);
  const websiteTotal = perSource.filter((s) => s.key !== "manual").reduce((a, s) => a + s.total, 0);
  const channelCount = (name: string) => n(channelRows.find((r) => String(r.ch).toLowerCase() === name.toLowerCase())?.c);
  const byChannel = [
    { label: "Website", count: websiteTotal + channelCount("Website") },
    { label: "Manual", count: channelCount("Manual") },
    { label: "Meta", count: channelCount("Meta") },
  ];

  // careers
  const appRows = await q(`SELECT status, COUNT(*) AS c, SUM(created_at >= NOW() - INTERVAL 7 DAY) AS w FROM job_applications GROUP BY status`);
  const applications = {
    total: appRows.reduce((a, r) => a + n(r.c), 0),
    week: appRows.reduce((a, r) => a + n(r.w), 0),
    byStatus: APPLICATION_STATUSES.map((s) => ({ status: s, count: n(appRows.find((r) => r.status === s)?.c) })),
  };
  const [jobs] = await q(
    `SELECT COUNT(*) AS total,
            SUM(is_open = 1 AND (deadline IS NULL OR deadline >= CURDATE())) AS live,
            SUM(is_open = 0) AS closed,
            SUM(is_open = 1 AND deadline IS NOT NULL AND deadline < CURDATE()) AS expired
       FROM job_openings`
  );
  const topJobs = (
    await q(`SELECT job_title AS t, COUNT(*) AS c FROM job_applications GROUP BY job_title ORDER BY c DESC LIMIT 4`)
  ).map((r) => ({ label: String(r.t), count: n(r.c) }));

  // team and content
  const [team] = await q(
    `SELECT COUNT(*) AS total, SUM(is_active = 1) AS active, SUM(role = 'super_admin') AS supers,
            SUM(last_login_at >= NOW() - INTERVAL 7 DAY) AS recent
       FROM crm_users`
  );
  const [blogs] = await q(`SELECT COUNT(*) AS total, SUM(is_published = 1) AS live FROM blogs`);

  // recent activity across leads, applications and payments
  const recentLeadSql = keys
    .map((k) => `(SELECT id, full_name, status, created_at, '${k}' AS src FROM \`${SOURCES[k].table}\` ORDER BY created_at DESC LIMIT 6)`)
    .join(" UNION ALL ");
  const recentLeads = (await q(`SELECT * FROM (${recentLeadSql}) t ORDER BY created_at DESC LIMIT 6`)).map((r) => ({
    type: "lead" as const,
    key: `lead-${r.src}-${r.id}`,
    title: String(r.full_name || "—"),
    sub: SOURCES[r.src as EnquirySource]?.short || "Lead",
    status: String(r.status || "new"),
    href: SOURCES[r.src as EnquirySource]?.href || "/crm/enquiries",
    at: new Date(r.created_at as string).toISOString(),
  }));
  const recentApps = (await q(`SELECT id, full_name, job_title, status, created_at FROM job_applications ORDER BY created_at DESC LIMIT 4`)).map((r) => ({
    type: "application" as const,
    key: `app-${r.id}`,
    title: String(r.full_name || "—"),
    sub: String(r.job_title || "Application"),
    status: String(r.status || "new"),
    href: "/crm/applications",
    at: new Date(r.created_at as string).toISOString(),
  }));
  let payRecentRows = await q(
    `SELECT * FROM (
       (SELECT id, client_name, service, status, amount, total_amount, currency, created_at, 'website' AS kind FROM payments WHERE source IN ('website','online') ORDER BY created_at DESC LIMIT 4)
       UNION ALL
       (SELECT id, client_name, service, status, amount, total_amount, currency, created_at, 'link' AS kind FROM payment_links ORDER BY created_at DESC LIMIT 4)
     ) t ORDER BY created_at DESC LIMIT 4`
  );
  if (!payRecentRows.length) {
    payRecentRows = await q(
      `SELECT id, client_name, service, status, amount, total_amount, currency, created_at, 'website' AS kind FROM payments WHERE source IN ('website','online') ORDER BY created_at DESC LIMIT 4`
    );
  }
  const recentPays = payRecentRows.map((r) => ({
    type: "payment" as const,
    key: `pay-${r.kind}-${r.id}`,
    title: String(r.client_name || "—"),
    sub: String(r.service || (r.kind === "link" ? "Payment link" : "Website payment")),
    status: String(r.status || "pending"),
    amount: n(r.status === "pending" ? r.total_amount || r.amount : r.amount),
    currency: String(r.currency || "USD"),
    href: r.kind === "link" ? "/crm/payments?tab=payment_link" : "/crm/payments?tab=website",
    at: new Date(r.created_at as string).toISOString(),
  }));
  const activity = [...recentLeads, ...recentApps, ...recentPays].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8);

  const totals = {
    leads: perSource.reduce((a, s) => a + s.total, 0),
    fresh: perSource.reduce((a, s) => a + s.fresh, 0),
    month: perSource.reduce((a, s) => a + s.month, 0),
    week: perSource.reduce((a, s) => a + s.week, 0),
  };

  return {
    totals,
    perSource,
    byStatus,
    byProject,
    leadTrend,
    byChannel,
    applications,
    jobs: { total: n(jobs?.total), live: n(jobs?.live), closed: n(jobs?.closed), expired: n(jobs?.expired) },
    topJobs,
    team: { total: n(team?.total), active: n(team?.active), supers: n(team?.supers), recent: n(team?.recent) },
    blogs: { total: n(blogs?.total), live: n(blogs?.live) },
    activity,
  };
}
