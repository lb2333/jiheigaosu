'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface GlassPanelProps {
  id?: string;
  title: string;
  subtitle?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  headerRight?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function GlassPanel({
  id,
  title,
  subtitle,
  collapsible = false,
  defaultCollapsed = false,
  headerRight,
  className = '',
  bodyClassName = '',
  children,
}: GlassPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div id={id} className={`glass-panel ${collapsed ? 'collapsed' : ''} ${className}`}>
      <div
        className="panel-header"
        onClick={collapsible ? () => setCollapsed((c) => !c) : undefined}
        style={collapsible ? undefined : { cursor: 'default' }}
      >
        <div className="panel-title-group">
          <span className="panel-accent-bar" />
          <span className="panel-title">{title}</span>
          {subtitle ? <span className="panel-subtitle">{subtitle}</span> : null}
        </div>
        {headerRight ? (
          <div onClick={(e) => e.stopPropagation()}>{headerRight}</div>
        ) : collapsible ? (
          <button type="button" className="panel-toggle-btn" aria-label="折叠或展开">
            <ChevronDown size={15} />
          </button>
        ) : null}
      </div>
      <div className={`panel-body ${bodyClassName}`}>{children}</div>
    </div>
  );
}
