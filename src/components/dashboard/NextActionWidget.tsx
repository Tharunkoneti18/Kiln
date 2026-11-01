import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Target } from 'lucide-react';
import type { PrimaryNextAction } from '@/lib/career/dashboard-service';

export default function NextActionWidget({ action }: { action: PrimaryNextAction }) {
  return (
    <div className="bg-white rounded-3xl p-7 border border-[#DCE9E1] shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
      {/* Soft botanical accent gradient */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#E2F4EB] to-transparent rounded-bl-full pointer-events-none opacity-80" />

      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5F5EB] text-[#1B6342] text-[11px] font-bold tracking-wide border border-[#CDE8D8]">
            <Target className="w-3.5 h-3.5 text-[#1B6342]" />
            <span>Primary Focus Action</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-[#577263]">
            <Clock className="w-3.5 h-3.5 text-[#739281]" />
            <span>~{action.estimated_minutes} mins</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#11241A] tracking-tight leading-snug">
            {action.title}
          </h2>
          <p className="text-sm text-[#4E6859] mt-2 leading-relaxed max-w-xl">
            {action.type === 'tutor_lesson'
              ? 'Hands-on interactive learning module mapped to your verified skill-gap priority.'
              : action.type === 'mock_interview'
              ? 'Role-targeted 5-question interview practice evaluated against 1-4 anchored rubrics.'
              : 'Key capability milestone designed to strengthen your target role profile.'}
          </p>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Link
            href={action.action_url}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1B6342] hover:bg-[#144E33] text-white text-xs font-bold shadow-xs transition-all duration-200 group-hover:translate-x-0.5"
          >
            <span>{action.type === 'tutor_lesson' ? 'Launch Lesson in Tutor' : 'Start Focus Task'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-xs text-[#708B7C]">No prerequisites blocking</span>
        </div>
      </div>
    </div>
  );
}
