import { redirect } from "next/navigation";
import { isServiceFormKey } from "@/lib/formOptions";

type Props = { params: Promise<{ service: string }> };

/* Service form enquiries now live in All Enquiries */
export default async function ServiceEnquiriesPage({ params }: Props) {
  const { service } = await params;
  redirect(isServiceFormKey(service) ? `/crm/enquiries?source=${service}` : "/crm/enquiries");
}
