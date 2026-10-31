import type { Metadata } from "next";
import { connection } from "next/server";
import CareerView from "@/components/CareerView";
import { listOpenJobs } from "@/lib/jobsData";
import type { Job } from "@/lib/jobs";

export const metadata: Metadata = {
  title: "Careers at Quickupp Softech – Build Your Future With Us",
  description:
    "We're always looking for talented individuals who are passionate about their work, eager to learn, and ready to make an impact. Explore career opportunities at Quickupp Softech.",
};

export default async function CareerPage() {
  // job openings are managed in the CRM, so read them on every visit
  await connection();
  let jobs: Job[] = [];
  try {
    jobs = await listOpenJobs();
  } catch (err) {
    console.error("[career] couldn't load job openings:", err);
  }
  return <CareerView jobs={jobs} />;
}
