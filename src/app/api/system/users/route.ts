import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs, user } from '@/db/schema';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['admin', 'engineer', 'supervisor', 'viewer']),
  department: z.string().min(1).default('建管指挥部'),
  sectionScope: z.string().min(1).default('all'),
});

const patchUserSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['admin', 'engineer', 'supervisor', 'viewer']).optional(),
  banned: z.boolean().optional(),
  department: z.string().min(1).optional(),
  sectionScope: z.string().min(1).optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      department: user.department,
      sectionScope: user.sectionScope,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: '仅管理员可执行账号新增操作' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '参数格式校验失败', issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const created = await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
    },
  });

  if (!created?.user?.id) {
    return NextResponse.json({ error: '创建账号失败' }, { status: 500 });
  }

  const [updated] = await db
    .update(user)
    .set({
      role: data.role,
      department: data.department,
      sectionScope: data.sectionScope,
      emailVerified: true,
    })
    .where(eq(user.id, created.user.id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      department: user.department,
      sectionScope: user.sectionScope,
      createdAt: user.createdAt,
    });

  await db.insert(auditLogs).values({
    userId: session.user.id,
    userName: session.user.name,
    action: 'CREATE_USER',
    moduleId: 'system',
    target: data.email,
    detail: { role: data.role, department: data.department },
    ipAddress: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });

  return NextResponse.json({ user: updated }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: '仅管理员可执行权限变更操作' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patchUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '参数校验失败' }, { status: 400 });
  }

  const { id, ...fields } = parsed.data;
  if (id === session.user.id && fields.banned === true) {
    return NextResponse.json({ error: '不能禁用当前登录管理员账号' }, { status: 400 });
  }

  const [updated] = await db
    .update(user)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      department: user.department,
      sectionScope: user.sectionScope,
      createdAt: user.createdAt,
    });

  if (!updated) return NextResponse.json({ error: '用户不存在' }, { status: 404 });

  await db.insert(auditLogs).values({
    userId: session.user.id,
    userName: session.user.name,
    action: 'UPDATE_USER_RBAC',
    moduleId: 'system',
    target: updated.email,
    detail: fields,
    ipAddress: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });

  return NextResponse.json({ user: updated });
}
