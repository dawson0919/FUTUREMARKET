import { SignIn } from "@clerk/nextjs";
import { InAppBrowserGuard } from "@/components/auth/InAppBrowserGuard";

export default function SignInPage() {
  return (
    <InAppBrowserGuard>
      <div className="flex items-center justify-center py-20">
        <SignIn forceRedirectUrl="/" />
      </div>
    </InAppBrowserGuard>
  );
}
