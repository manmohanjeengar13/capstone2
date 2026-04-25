export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 radial-glow pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
