import { redirect } from "next/navigation";

// The main dashboard page lives at /dashboard.
// This root page redirects there.
export default function RootPage() {
  redirect("/dashboard");
}
