import LoginForm from "./LoginForm";

export default function AdminLogin() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-paper p-8 shadow-sm">
        <img src="/logo.png" alt="altorancho." width={800} height={136} className="h-7 w-auto" />
        <h1 className="mb-6 mt-6 text-[22px] font-semibold tracking-[-0.03em]">Panel de contenidos</h1>
        <LoginForm />
      </div>
    </div>
  );
}
