import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import type { SkillReadinessBreakdown } from '@/lib/career/dashboard-service';

export default function ReadinessSummaryWidget({
  breakdown,
  targetRoleTitle,
}: {
  breakdown: SkillReadinessBreakdown;
  targetRoleTitle: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-7 border border-[#DCE9E1] shadow-xs flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#557161]">
            <ShieldCheck className="w-4 h-4 text-[#206945]" />
            <span>Target Role Fit</span>
          </div>
          <span className="text-2xl font-black text-[#1B6342]">
            {breakdown.readinessScore}%
          </span>
        </div>

        <div>
          <span className="text-xs text-[#718E7F] font-semibold block uppercase tracking-wider">
            Targeting
          </span>
          <h3 className="text-base font-extrabold text-[#11241A] truncate mt-0.5">
            {targetRoleTitle || 'Junior Data Analyst'}
          </h3>
        </div>

        {/* 4 Stat Pills */}
        <div className="grid grid-cols-4 gap-2 text-center pt-1">
          <div className="p-2.5 rounded-2xl bg-[#E8F6EF] border border-[#CDEADC]">
            <span className="block text-[10px] font-bold text-[#18603E] uppercase tracking-wider">
              Proven
            </span>
            <span className="text-lg font-black text-[#133F2B]">{breakdown.demonstratedCount}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#EEF5FB] border border-[#D0E4F5]">
            <span className="block text-[10px] font-bold text-[#1C5B94] uppercase tracking-wider">
              Claimed
            </span>
            <span className="text-lg font-black text-[#154673]">{breakdown.supportedCount}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FEF6EC] border border-[#FBE3C8]">
            <span className="block text-[10px] font-bold text-[#A56314] uppercase tracking-wider">
              Bridge
            </span>
            <span className="text-lg font-black text-[#7D490B]">{breakdown.transferableCount}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FDF0EE] border border-[#F8D2CC]">
            <span className="block text-[10px] font-bold text-[#A63324] uppercase tracking-wider">
              Gaps
            </span>
            <span className="text-lg font-black text-[#7F2418]">{breakdown.gapCount}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#EDF4F0] flex items-center justify-between text-xs">
        <span className="text-[#648071]">{breakdown.totalSkills} critical skills tracked</span>
        <Link
          href="/map"
          className="font-bold text-[#1B6342] hover:text-[#124A30] inline-flex items-center gap-0.5 transition"
        >
          <span>Deep Map</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
