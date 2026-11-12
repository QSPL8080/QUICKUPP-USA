"use client";

import { useFeedback } from "@/components/crm/Feedback";
import { payLinkUrl } from "@/lib/siteUrl";
import { mailtoUrl, payEmail, payMessage, smsUrl, whatsAppNumber, whatsAppUrl, type PayMessageInput } from "@/lib/payMessages";

/*
 * The ways to send a client their payment link (or balance link): copy the
 * link, WhatsApp, text message (SMS) and email. WhatsApp and text use the same
 * message; email has its own subject and wording (lib/payMessages).
 *
 * A text message can only be sent from a phone or a texting app, so the Text
 * message button also copies the message: if no texting app opens on this
 * computer, it can be pasted wherever the team sends texts from.
 */

type Props = {
  link: PayMessageInput & { clientPhone?: string | null; clientEmail?: string | null };
  /** "Payment link" or "Balance link", for the copied notice */
  what?: string;
  centered?: boolean;
};

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const WaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.17 1.6 6L0 24l6.19-1.62a11.93 11.93 0 0 0 5.87 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.44zm-8.46 18.36h-.01a9.92 9.92 0 0 1-5.06-1.39l-.36-.22-3.76.99 1-3.66-.24-.38a9.93 9.93 0 0 1-1.52-5.21c0-5.5 4.47-9.97 9.97-9.97 2.66 0 5.16 1.04 7.05 2.92a9.92 9.92 0 0 1 2.92 7.05c0 5.5-4.48 9.97-9.99 9.97zm5.46-7.46c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.51s1.08 2.91 1.23 3.11c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.27-.2-.57-.35z" />
  </svg>
);

export default function ShareLinkButtons({ link, what = "Payment link", centered }: Props) {
  const { toast } = useFeedback();
  if (!link.token) return null;

  const url = payLinkUrl(link.token);
  const message = payMessage(link);
  const email = payEmail(link);
  const number = whatsAppNumber(link.clientPhone);

  const copyLink = () =>
    navigator.clipboard.writeText(url).then(
      () => toast(`${what} copied`),
      () => toast("Couldn't copy. Select the link and copy it instead.", "error")
    );

  const textMessage = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(message);
      copied = true;
    } catch {}
    // opens the phone's / computer's texting app with the message filled in, where there is one
    window.location.href = smsUrl(link.clientPhone, message);
    toast(
      copied
        ? `Text message copied${number ? ` for +${number}` : ""}. If no texting app opened, paste it into a text to the client.`
        : "Couldn't copy the message. Use WhatsApp or Email instead.",
      copied ? "ok" : "error"
    );
  };

  return (
    <div className="crm-share-links" style={centered ? { justifyContent: "center" } : undefined}>
      <button type="button" className="crm-act crm-act-dark crm-act-sm" onClick={copyLink} title="Copy the link">
        <Icon>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </Icon>
        <span>Copy link</span>
      </button>
      <a className="crm-act crm-act-sm crm-act-wa" href={whatsAppUrl(link.clientPhone, message)} target="_blank" rel="noopener noreferrer" title="Send on WhatsApp">
        <WaIcon />
        <span>WhatsApp</span>
      </a>
      <button type="button" className="crm-act crm-act-ghost crm-act-sm" onClick={textMessage} title={number ? `Text message to +${number}` : "Text message"}>
        <Icon>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </Icon>
        <span>Text message</span>
      </button>
      <a className="crm-act crm-act-ghost crm-act-sm" href={mailtoUrl(link.clientEmail, email.subject, email.body)} title={link.clientEmail ? `Email to ${link.clientEmail}` : "Email"}>
        <Icon>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 6L2 7" />
        </Icon>
        <span>Email</span>
      </a>
    </div>
  );
}
