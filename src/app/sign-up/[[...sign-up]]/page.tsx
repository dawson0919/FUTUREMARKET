import { SignUp } from "@clerk/nextjs";
import { InAppBrowserGuard } from "@/components/auth/InAppBrowserGuard";

export default function SignUpPage() {
  return (
    <InAppBrowserGuard>
      <div className="flex items-center justify-center py-20">
        <SignUp forceRedirectUrl="/" />
      </div>
    </InAppBrowserGuard>
  );
}
