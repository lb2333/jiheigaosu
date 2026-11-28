import Link from 'next/link';
import { Compass, Home, LogIn } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_50%_0%,#0b2654_0%,#05132b_65%,#030b1c_100%)] text-[#f1f7ff] flex items-center justify-center p-6">
      <div className="w-[min(520px,94%)] rounded-2xl border border-cyan-400/40 bg-gradient-to-b from-[#0b2350]/95 to-[#061634]/95 p-8 text-center shadow-[0_20px_60px_rgba(0,6,24,0.8)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/45 bg-cyan-500/15 text-cyan-300 shadow-[0_0_24px_rgba(56,242,255,0.28)]">
          <Compass size={28} />
        </div>
        <div className="text-4xl font-extrabold tracking-widest text-cyan-300 tabular-nums">
          404
        </div>
        <h1 className="mt-2 text-lg font-bold text-white">未找到对应的工程业务页面</h1>
        <p className="mt-2 text-xs leading-relaxed text-sky-200/80">
          您访问的路径不存在或模块子页已调整，请返回综合首页全线三维总览视图继续操作。
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/home/overview"
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/75 bg-gradient-to-b from-sky-500 to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-110"
          >
            <Home size={14} />
            <span>返回综合首页</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-950/75 px-4 py-2 text-xs font-medium text-sky-100 hover:border-cyan-300 hover:text-white"
          >
            <LogIn size={14} />
            <span>前往登录页</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
