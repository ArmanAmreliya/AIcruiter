'use client';

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-black">
      <div id="clerk-captcha" />
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
