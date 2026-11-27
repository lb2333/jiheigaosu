'use client';

import {
  AlertCircle,
  Building2,
  Calendar,
  ChevronRight,
  Construction,
  Factory,
  FileText,
  Flag,
  Layers,
  Leaf,
  Milestone,
  Mountain,
  Route,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export function M02Icon({ name, size = 16 }: { name: string; size?: number }) {
  switch (name) {
    case 'subgrade':
      return <Mountain size={size} className="text-sky-300 shrink-0" />;
    case 'bridge':
      return <Milestone size={size} className="text-cyan-300 shrink-0" />;
    case 'pavement':
      return <Route size={size} className="text-sky-300 shrink-0" />;
    case 'yard':
      return <Building2 size={size} className="text-cyan-300 shrink-0" />;
    case 'guardrail':
      return <Construction size={size} className="text-sky-300 shrink-0" />;
    case 'leaf':
      return <Leaf size={size} className="text-emerald-300 shrink-0" />;
    case 'plant':
      return <Factory size={size} className="text-sky-300 shrink-0" />;
    case 'excavator':
      return <Construction size={size} className="text-amber-300 shrink-0" />;
    case 'layers':
      return <Layers size={size} className="text-cyan-300 shrink-0" />;
    case 'doc':
      return <FileText size={size} className="text-sky-300 shrink-0" />;
    case 'calendar':
      return <Calendar size={size} className="text-sky-300 shrink-0" />;
    case 'flag':
      return <Flag size={size} className="text-cyan-300 shrink-0" />;
    case 'alert':
      return <AlertCircle size={size} className="text-amber-300 shrink-0" />;
    case 'speed':
      return <TrendingUp size={size} className="text-cyan-300 shrink-0" />;
    case 'shield':
      return <ShieldCheck size={size} className="text-emerald-300 shrink-0" />;
    case 'chevronRight':
      return <ChevronRight size={size} className="shrink-0" />;
    default:
      return <Layers size={size} className="text-sky-300 shrink-0" />;
  }
}
