import { Link, Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden overscroll-none bg-background text-foreground">
      {/* Nền sáng Digital Horizon */}
      <div className="pointer-events-none absolute inset-0 nebula-gradient" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-secondary/[0.07]" />
      <div className="pointer-events-none absolute -right-[15%] top-[5%] h-[min(55vh,520px)] w-[min(55vw,520px)] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-[20%] bottom-[0%] h-[min(50vh,480px)] w-[min(50vw,480px)] rounded-full bg-secondary/12 blur-3xl" />

      <header className="relative z-20 shrink-0 px-4 pt-4 sm:px-8 sm:pt-6">
        <Link
          to="/"
          className="inline-flex flex-col gap-0.5 transition-opacity hover:opacity-90"
        >
          <span className="text-lg font-bold tracking-tight sm:text-xl">
            <span className="text-foreground">Nexo</span>{" "}
            <span className="text-primary">Social</span>
          </span>
          <span className="max-w-[18rem] text-[11px] leading-snug text-muted-foreground sm:text-xs">
            Không gian kết nối tinh tế — giao lưu chân thật, trải nghiệm xã hội
            hiện đại.
          </span>
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col justify-center px-4 py-3 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};
