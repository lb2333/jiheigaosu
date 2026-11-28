'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#040f24]/88 p-6">
      <div className="w-[min(480px,92%)] rounded-xl border border-rose-400/45 bg-gradient-to-b from-[#0b2350] to-[#071738] p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-rose-300">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-400/40 bg-rose-500/15">
            <AlertTriangle size={20} />
          </span>
          <div>
            <h2 className="text-base font-bold text-white">当前页面渲染异常</h2>
            <p className="text-xs text-sky-200/80">G1211吉黑高速工程建设项目综合管理平台</p>
          </div>
        </div>

        <p className="mt-4 rounded-lg border border-sky-400/20 bg-[#041128]/75 px-3.5 py-2.5 text-xs leading-relaxed text-sky-100/90">
          {error.message || '模块加载或数据渲染时发生意外错误，请点击下方按钮重试。'}
        </p>

        {error.digest ? (
          <p className="mt-2 text-[11px] text-sky-300/70 tabular-nums">
            错误追踪码：{error.digest}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/75 bg-gradient-to-b from-sky-500 to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-110 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>重试渲染</span>
          </button>
          <Link
            href="/home/overview"
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-950/75 px-4 py-2 text-xs font-medium text-sky-100 hover:border-cyan-300 hover:text-white"
          >
            <Home size={13} />
            <span>返回综合首页</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
