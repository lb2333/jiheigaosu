import {
  pgTable,
  text,
  integer,
  boolean,
  doublePrecision,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

/**
 * 参建组织台账（11个组织：项目办 1 + 监理单位 4 + 施工单位 6）
 * 注意：项目办 sectionId 为 'line'（全线），workSections.id 仅包含 sec1~sec6，
 * 故此处不加 .references(() => workSections.id) 外键约束（同 m02.ts）。
 */
export const staffOrganizations = pgTable(
  'staff_organizations',
  {
    id: text('id').primaryKey(), // 'org-xmb', 'org-jl1'..'org-jl4', 'org-sg1'..'org-sg6'
    name: text('name').notNull(),
    type: text('type').notNull(), // '项目办' | '监理单位' | '施工单位'
    sectionId: text('section_id').notNull(), // 'line' | 'sec1' ~ 'sec6'
    sectionName: text('section_name').notNull(), // '全线' | '一工区' ~ '六工区'
    headcount: integer('headcount').notNull().default(0),
    lon: doublePrecision('lon').notNull(),
    lat: doublePrecision('lat').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m05_org_type_sec_idx').on(t.type, t.sectionId, t.sortOrder)]
);

/**
 * 人员台账（186人：RY-xxxx）
 */
export const staffMembers = pgTable(
  'staff_members',
  {
    id: text('id').primaryKey(), // 'RY-0201' ..
    name: text('name').notNull(),
    orgId: text('org_id')
      .notNull()
      .references(() => staffOrganizations.id, { onDelete: 'cascade' }),
    sectionId: text('section_id').notNull(), // 'line' | 'sec1' ~ 'sec6'
    role: text('role').notNull(),
    status: text('status').notNull().default('在岗'), // '在岗' | '暂未在岗'
    phone: text('phone').notNull(),
    cert: text('cert').notNull(),
    certValid: text('cert_valid').notNull(),
    joinDate: text('join_date').notNull(),
    duty: text('duty').notNull(),
    offReason: text('off_reason').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m05_staff_org_sort_idx').on(t.orgId, t.sortOrder),
    index('m05_staff_sec_status_idx').on(t.sectionId, t.status),
  ]
);

/**
 * 关键岗位配置（36个岗位：GW-xx-xx，33已配置 / 3待配置）
 */
export const staffKeyRoles = pgTable(
  'staff_key_roles',
  {
    code: text('code').primaryKey(), // 'GW-02-03' ..
    orgId: text('org_id')
      .notNull()
      .references(() => staffOrganizations.id, { onDelete: 'cascade' }),
    sectionId: text('section_id').notNull(), // 'line' | 'sec1' ~ 'sec6'
    roleName: text('role_name').notNull(),
    holderId: text('holder_id').references(() => staffMembers.id, { onDelete: 'set null' }),
    assignDate: text('assign_date'),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m05_role_org_sort_idx').on(t.orgId, t.sortOrder),
    index('m05_role_sec_name_idx').on(t.sectionId, t.roleName),
  ]
);

/**
 * 考勤异常记录（KQ-20261126-01..03）
 */
export const staffAttendanceAnomalies = pgTable(
  'staff_attendance_anomalies',
  {
    id: text('id').primaryKey(), // 'KQ-20261126-01' ..
    staffId: text('staff_id')
      .notNull()
      .references(() => staffMembers.id, { onDelete: 'cascade' }),
    orgId: text('org_id')
      .notNull()
      .references(() => staffOrganizations.id, { onDelete: 'cascade' }),
    sectionId: text('section_id').notNull(), // 'line' | 'sec1' ~ 'sec6'
    roleName: text('role_name').notNull(),
    type: text('type').notNull(), // '签到记录待核' | '未签到' | '请假待确认'
    time: text('time').notNull(),
    date: text('date').notNull(),
    note: text('note').notNull(),
    resolved: boolean('resolved').notNull().default(false),
    handleNote: text('handle_note').notNull().default(''),
    resolvedBy: text('resolved_by').notNull().default(''),
    resolvedAt: text('resolved_at').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m05_anom_date_res_sec_idx').on(t.date, t.resolved, t.sectionId)]
);
