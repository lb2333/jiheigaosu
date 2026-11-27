'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const DEMO_ACCOUNTS = [
  { label: '指挥部管理员', email: 'admin@jihei.cn', pass: 'Jihei@2026', role: 'admin' },
  { label: '二工区总工', email: 'sec2@jihei.cn', pass: 'Jihei@2026', role: 'engineer' },
  { label: '总监理工程师', email: 'supervisor@jihei.cn', pass: 'Jihei@2026', role: 'supervisor' },
  { label: '展厅讲解员', email: 'guide@jihei.cn', pass: 'Jihei@2026', role: 'viewer' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/home/overview';
  const allowDemo = process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN !== 'false';

  const [email, setEmail] = useState('admin@jihei.cn');
  const [password, setPassword] = useState('Jihei@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function doLogin(targetEmail: string, targetPass: string) {
    setLoading(true);
    setError('');
    try {
      const res = await authClient.signIn.email({
        email: targetEmail,
        password: targetPass,
      });
      if (res.error) {
        setError(res.error.message || '账号或密码错误');
        setLoading(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录请求失败');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-[#040f24] px-4">
      <div
        className="absolute inset-0 pointer-events-none opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(circle at 22% 24%, rgba(56, 242, 255, 0.22), transparent 46%), radial-gradient(circle at 78% 76%, rgba(22, 119, 255, 0.26), transparent 48%), linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 100% 100%, 42px 42px, 42px 42px',
        }}
      />

      <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-cyan-400/45 bg-[#081c40]/88 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,8,28,0.85),0_0_32px_rgba(34,211,238,0.18)] p-7">
        <div className="flex items-center gap-3 pb-5 mb-5 border-b border-sky-400/25">
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-cyan-300/50 flex items-center justify-center text-cyan-300 shadow-[0_0_16px_rgba(56,242,255,0.28)]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-white tracking-wide">
              G1211吉黑高速明水至北安段
            </h1>
            <p className="text-[12px] text-sky-300/90 mt-0.5">
              工程建设项目综合管理平台 · 统一身份认证
            </p>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            doLogin(email, password);
          }}
        >
          <div>
            <label className="block text-[12px] font-semibold text-sky-200 mb-1.5">
              平台账号（邮箱）
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#051430]/90 border border-sky-400/40 text-white text-[13px] outline-none focus:border-cyan-300"
                placeholder="例如 admin@jihei.cn"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-sky-200 mb-1.5">
              登录密码
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#051430]/90 border border-sky-400/40 text-white text-[13px] outline-none focus:border-cyan-300"
                placeholder="请输入密码"
              />
            </div>
          </div>

          {error ? (
            <div className="text-[12px] px-3 py-2 rounded-lg bg-red-500/15 border border-red-400/45 text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg bg-gradient-to-b from-sky-500 to-blue-600 border border-sky-300/60 text-white font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(22,119,255,0.45)] hover:brightness-110 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? '正在验证并进入三维平台...' : '登录进入平台'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {allowDemo ? (
          <div className="mt-6 pt-4 border-t border-sky-400/20">
            <div className="text-[11.5px] text-sky-300/85 mb-2.5 flex items-center justify-between">
              <span>展厅 / 评审快捷角色登录</span>
              <span className="text-cyan-300/90 font-mono text-[11px]">PostgreSQL RBAC</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.pass);
                    doLogin(acc.email, acc.pass);
                  }}
                  className="text-left px-2.5 py-2 rounded-lg bg-sky-950/75 border border-sky-400/30 hover:border-cyan-300/70 hover:bg-sky-900/50 transition cursor-pointer"
                >
                  <div className="text-[12px] font-semibold text-white">{acc.label}</div>
                  <div className="text-[10.5px] text-sky-300/80 font-mono">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#040f24]" />}>
      <LoginForm />
    </Suspense>
  );
}
