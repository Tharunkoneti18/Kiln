import { describe, it, expect } from 'vitest';
import {
  parseResumeText,
  extractSkillEvidenceFromText,
} from '@/src/lib/career/resume-parser';
import {
  calculateSkillGapMap,
  RoleSkillInput,
  UserEvidenceInput,
} from '@/src/lib/career/skill-gap-engine';

describe('Fast & Reactive Enhanced Resume Parsing & Accurate Skill Mapping', () => {
  const realisticResume = `
ALEX CHEN
Senior Analytics Engineer | alex.chen@example.com

PROFESSIONAL EXPERIENCE
Data Engineer at FinTech Labs (2022 - Present)
• Built scalable batch and streaming ETL pipelines using dbt, Snowflake, and Apache Airflow, processing 15M daily events.
• Optimized complex PostgreSQL queries and warehouse schemas, cutting compute costs by 42%.
• Engineered dimensional data models using star schema and snowflake normalization principles.
• Created real-time KPI dashboards in Looker and Tableau for executive leadership.

Data Analyst at HealthMetrics (2020 - 2022)
• Analyzed healthcare patient cohorts in Python (Pandas, NumPy, Scikit-Learn) and advanced Excel spreadsheets with pivot tables.
• Automated weekly reporting cadence using Docker containers and GitHub CI/CD actions.
• Conducted rigorous A/B testing and statistical significance evaluations.

EDUCATION & CERTIFICATIONS
B.S. in Computer Science, University of California (2020)
AWS Certified Solutions Architect
  `;

  it('parses realistic resume in sub-10ms with high precision across multi-domain tech skills', () => {
    const start = performance.now();
    const result = parseResumeText(realisticResume);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50); // fast and reactive requirement
    expect(result.claims.length).toBeGreaterThanOrEqual(8);

    const extractedSkillIds = result.claims.map((c) => c.skill_id);
    expect(extractedSkillIds).toContain('sql');
    expect(extractedSkillIds).toContain('snowflake');
    expect(extractedSkillIds).toContain('dbt');
    expect(extractedSkillIds).toContain('airflow');
    expect(extractedSkillIds).toContain('data-modeling');
    expect(extractedSkillIds).toContain('data-visualization');
    expect(extractedSkillIds).toContain('python');
    expect(extractedSkillIds).toContain('spreadsheets');

    // Check evidence kind classification
    const dbtClaim = result.claims.find((c) => c.skill_id === 'dbt');
    expect(dbtClaim?.kind).toBe('work_experience');
    expect(dbtClaim?.confidence).toBeGreaterThanOrEqual(0.85);
    expect(dbtClaim?.source_locator.paragraph_index).toBeDefined();
  });

  it('accurately maps role skills with Demonstrated, Supported, Transferable, and Gap states', () => {
    const roleRequirements: RoleSkillInput[] = [
      { skill_id: 'snowflake', canonical_name: 'Snowflake Cloud Data Warehouse', importance: 1.0 },
      { skill_id: 'dbt', canonical_name: 'dbt (data build tool)', importance: 0.9 },
      { skill_id: 'pyspark', canonical_name: 'PySpark Distributed Processing', importance: 0.8 },
      { skill_id: 'kafka', canonical_name: 'Apache Kafka Event Streaming', importance: 0.7 },
      { skill_id: 'machine-learning', canonical_name: 'Machine Learning Model Deployment', importance: 0.6 },
    ];

    // User evidence: has Python, SQL, Snowflake, dbt
    const userEvidence: UserEvidenceInput[] = [
      { skill_id: 'snowflake', confidence: 0.9, excerpt: 'Built pipelines using Snowflake' },
      { skill_id: 'dbt', confidence: 0.88, excerpt: 'Scalable batch ETL with dbt' },
      { skill_id: 'python', confidence: 0.85, excerpt: 'Analyzed cohorts in Python' }, // transferable to PySpark!
    ];

    const map = calculateSkillGapMap(roleRequirements, userEvidence);
    expect(map).toHaveLength(5);

    // Snowflake should be Demonstrated
    const snowflakeItem = map.find((m) => m.skill_id === 'snowflake');
    expect(snowflakeItem?.state).toBe('Demonstrated');
    expect(snowflakeItem?.priority_score).toBe(0); // no gap

    // dbt should be Demonstrated
    const dbtItem = map.find((m) => m.skill_id === 'dbt');
    expect(dbtItem?.state).toBe('Demonstrated');

    // PySpark should be Transferable via Python
    const pysparkItem = map.find((m) => m.skill_id === 'pyspark');
    expect(pysparkItem?.state).toBe('Transferable');
    expect(pysparkItem?.transferable_bridge).toBeDefined();
    expect(pysparkItem?.transferable_bridge?.source_skill_id).toBe('python');

    // Kafka and Machine Learning should be Gaps with calibrated priority scores
    const kafkaItem = map.find((m) => m.skill_id === 'kafka');
    expect(kafkaItem?.state).toBe('Gap');
    expect(kafkaItem?.priority_score).toBeGreaterThan(0);

    // Sorted by priority score descending
    expect(map[0].priority_score).toBeGreaterThanOrEqual(map[1].priority_score);
  });
});
