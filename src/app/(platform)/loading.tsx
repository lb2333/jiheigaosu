export default function PlatformLoading() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-15 flex items-center justify-center p-6"
      aria-busy="true"
      aria-label="正在加载平台业务视图"
    >
      <div className="w-[min(440px,92%)] rounded-xl border border-cyan-400/35 bg-[#081c42]/88 px-5 py-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-1 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(250,204,21,0.65)]" />
          <div className="h-3.5 w-36 animate-pulse rounded bg-sky-300/25" />
          <span className="ml-auto text-xs text-sky-200/80">正在加载平台业务视图...</span>
        </div>
        <div className="mt-3.5 space-y-2.5">
          <div className="h-3 w-full animate-pulse rounded bg-sky-400/15" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-sky-400/15" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-sky-400/10" />
        </div>
      </div>
    </div>
  );
}
