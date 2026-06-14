'use client';

// app/sign-in/[[...sign-in]]/page.tsx
// Clerk-hosted sign-in page with custom styling

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#EAEDED] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F1111]">
            Welcome back to{' '}
            <span className="text-[#00838F]">Nia</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Sign in to access your orders, addresses, and personalized recommendations.
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-[#00838F] hover:bg-[#006d75] text-sm',
              card: 'shadow-md border border-[#D5D9D9] rounded-sm',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
            },
          }}
        />
      </div>
    </main>
  );
}
