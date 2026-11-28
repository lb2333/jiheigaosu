import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'G1211吉黑高速明水至北安段工程建设项目综合管理平台',
  description: 'G1211吉黑高速明水至北安段三维数字孪生与工程建设综合管理全栈平台',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23041126'/%3E%3Cpath d='M8 22L16 8l8 14H8z' fill='%2338f2ff'/%3E%3C/svg%3E"
        />
      </head>
      <body className="bg-[#040f24] text-[#f1f7ff] antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
