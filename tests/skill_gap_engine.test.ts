import { describe, it, expect } from 'vitest';
import { calculateSkillGapMap, SkillGapItem } from '../src/lib/career/skill-gap-engine';

describe('Sourced Skill-Gap Engine', () => {
  const roleSkills = [
    { skill_id: 'sql', canonical_name: 'SQL (Structured Query Language)', importance: 1.0, source_ref: 'Required core duty' },
    { skill_id: 'python', canonical_name: 'Python Programming', importance: 0.9, source_ref: 'Secondary scripting requirement' },
    { skill_id: 'data-visualization', canonical_name: 'Data Visualization', importance: 0.8, source_ref: 'Dashboarding with Tableau/Power BI' },
    { skill_id: 'cloud-data', canonical_name: 'Cloud Data Platforms', importance: 0.7, source_ref: 'Familiarity with cloud warehouse' },
  ];

  it('marks skill as Demonstrated when verified assessment or project proof exists', () => {
    const userEvidence = [
      { skill_id: 'sql', state: 'Demonstrated' as const, confidence: 0.9, excerpt: 'Verified assessment score 1.0' },
    ];

    const map = calculateSkillGapMap(roleSkills, userEvidence);
    const sqlItem = map.find(s => s.skill_id === 'sql');

    expect(sqlItem).toBeDefined();
    expect(sqlItem?.state).toBe('Demonstrated');
    expect(sqlItem?.priority_score).toBe(0); // Closed gap has 0 priority
  });

  it('marks skill as Supported when profile claim exists without verified proof', () => {
    const userEvidence = [
      { skill_id: 'data-visualization', state: 'Supported' as const, confidence: 0.7, excerpt: 'Built Tableau charts' },
    ];

    const map = calculateSkillGapMap(roleSkills, userEvidence);
    const item = map.find(s => s.skill_id === 'data-visualization');

    expect(item?.state).toBe('Supported');
    expect(item?.confidence).toBe(0.7);
    expect(item?.provenance).toContain('Built Tableau charts');
  });

  it('identifies Transferable skills with explicit bridge explanations rather than silent equivalence', () => {
    const userEvidence = [
      { skill_id: 'spreadsheets', state: 'Demonstrated' as const, confidence: 0.85, excerpt: 'Advanced Excel modeling' },
    ];

    // User knows spreadsheets, role needs SQL
    const map = calculateSkillGapMap(roleSkills, userEvidence);
    const sqlItem = map.find(s => s.skill_id === 'sql');

    expect(sqlItem?.state).toBe('Transferable');
    expect(sqlItem?.transferable_bridge).toBeDefined();
    expect(sqlItem?.transferable_bridge?.source_skill_id).toBe('spreadsheets');
    expect(sqlItem?.transferable_bridge?.explanation).toContain('relational');
  });

  it('classifies missing capability with zero evidence as Gap and prioritizes by role importance', () => {
    const userEvidence: any[] = [];
    const map = calculateSkillGapMap(roleSkills, userEvidence);

    const pythonItem = map.find(s => s.skill_id === 'python');
    expect(pythonItem?.state).toBe('Gap');
    expect(pythonItem?.priority_score).toBeGreaterThan(0);

    // SQL with importance 1.0 should have higher priority than cloud-data with 0.7
    const sqlItem = map.find(s => s.skill_id === 'sql');
    const cloudItem = map.find(s => s.skill_id === 'cloud-data');
    expect(sqlItem!.priority_score).toBeGreaterThan(cloudItem!.priority_score);
  });
});
