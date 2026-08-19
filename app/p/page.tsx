import { Suspense } from "react";
import ProfileEditor from "@/components/profile/ProfileEditor";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-(--bg)" />
      }
    >
      <ProfileEditor />
    </Suspense>
  );
}