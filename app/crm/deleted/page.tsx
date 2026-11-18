import { redirect } from "next/navigation";

/* The tab was renamed to Bin: old links and bookmarks go there */
export default function DeletedRedirect() {
  redirect("/crm/bin");
}
