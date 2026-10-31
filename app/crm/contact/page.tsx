import { redirect } from "next/navigation";

/* Contact enquiries now live in All Enquiries */
export default function ContactEnquiriesPage() {
  redirect("/crm/enquiries?source=contact");
}
