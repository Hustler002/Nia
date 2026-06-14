// app/seller/login/layout.tsx
// Bare layout for login page — no sidebar, no auth check
// This overrides the seller console sidebar layout for the login route

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
