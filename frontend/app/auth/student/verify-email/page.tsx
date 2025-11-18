import { Suspense } from "react";
import VerifyEmailPage from "./VerifyEmailContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
