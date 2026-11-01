export type SkillState = 'Demonstrated' | 'Supported' | 'Transferable' | 'Gap' | 'Unknown';

export interface TransferableBridge {
  source_skill_id: string;
  source_skill_name: string;
  explanation: string;
  effort_level: 'low' | 'medium' | 'high';
}

export interface SkillGapItem {
  skill_id: string;
  canonical_name: string;
  importance: number;
  source_ref?: string;
  state: SkillState;
  confidence: number;
  priority_score: number;
  provenance: string;
  transferable_bridge?: TransferableBridge;
}

export interface RoleSkillInput {
  skill_id: string;
  canonical_name: string;
  importance: number;
  source_ref?: string;
}

export interface UserEvidenceInput {
  skill_id: string;
  state?: SkillState;
  confidence?: number;
  excerpt?: string;
}

// Curated transferable skill knowledge graph
const TRANSFERABLE_BRIDGES: Record<
  string,
  {
    source_id: string;
    source_name: string;
    explanation: string;
    effort: 'low' | 'medium' | 'high';
  }
> = {
  pyspark: {
    source_id: 'python',
    source_name: 'Python Data Processing',
    explanation:
      'Python data manipulation and DataFrame logic directly transfer to PySpark distributed RDD and Spark SQL execution models.',
    effort: 'medium',
  },
  snowflake: {
    source_id: 'sql',
    source_name: 'Relational SQL',
    explanation:
      'Relational query syntax and schema design transfer seamlessly into Snowflake cloud data warehousing and clustering keys.',
    effort: 'low',
  },
  dbt: {
    source_id: 'sql',
    source_name: 'Modular SQL',
    explanation:
      'SQL query authorship directly powers dbt model compilation, Jinja templating, and incremental snapshot strategies.',
    effort: 'low',
  },
  sql: {
    source_id: 'spreadsheets',
    source_name: 'Advanced Spreadsheets',
    explanation:
      'Spreadsheet tabular modeling and VLOOKUP experience transfers to relational schemas, GROUP BY aggregations, and JOIN operations.',
    effort: 'medium',
  },
  python: {
    source_id: 'sql',
    source_name: 'SQL Data Extraction',
    explanation:
      'Query logic and analytical transformations transfer directly into Python Pandas DataFrames and data manipulation pipelines.',
    effort: 'medium',
  },
  'data-visualization': {
    source_id: 'spreadsheets',
    source_name: 'Spreadsheet Charting',
    explanation:
      'Visualizing chart categories and summary tables transfers directly to interactive dashboard design in Tableau and Power BI.',
    effort: 'low',
  },
  'machine-learning': {
    source_id: 'python',
    source_name: 'Python Analytics',
    explanation:
      'Data preparation and mathematical computation in Python form the core foundation for training Scikit-Learn models.',
    effort: 'medium',
  },
  kafka: {
    source_id: 'airflow',
    source_name: 'Workflow Orchestration',
    explanation:
      'Batch DAG dependency concepts provide an intuitive mental model for event streaming and producer/consumer topic topologies.',
    effort: 'high',
  },
};

export function calculateSkillGapMap(
  roleSkills: RoleSkillInput[],
  userEvidence: UserEvidenceInput[]
): SkillGapItem[] {
  const evidenceMap = new Map<string, UserEvidenceInput>();
  for (const ev of userEvidence) {
    evidenceMap.set(ev.skill_id, ev);
  }

  return roleSkills
    .map((req) => {
      const directEvidence = evidenceMap.get(req.skill_id);

      if (directEvidence) {
        const state: SkillState =
          directEvidence.state ||
          (directEvidence.confidence && directEvidence.confidence >= 0.85
            ? 'Demonstrated'
            : 'Supported');

        const confidence = directEvidence.confidence ?? 0.7;
        const provenance = directEvidence.excerpt || 'Verified from user profile claims';

        // Gap magnitude: Demonstrated = 0, Supported = 0.25
        const gapMagnitude = state === 'Demonstrated' ? 0 : 0.25;
        const priority_score = Math.round(req.importance * gapMagnitude * 100);

        return {
          skill_id: req.skill_id,
          canonical_name: req.canonical_name,
          importance: req.importance,
          source_ref: req.source_ref,
          state,
          confidence,
          priority_score,
          provenance,
        };
      }

      // Check for transferable capability via bridges
      const bridge = TRANSFERABLE_BRIDGES[req.skill_id];
      if (bridge && evidenceMap.has(bridge.source_id)) {
        const sourceEvidence = evidenceMap.get(bridge.source_id)!;
        const confidence = Math.max(0.4, (sourceEvidence.confidence || 0.7) - 0.2);
        // Transferable gap magnitude = 0.45
        const priority_score = Math.round(req.importance * 0.45 * 100);

        return {
          skill_id: req.skill_id,
          canonical_name: req.canonical_name,
          importance: req.importance,
          source_ref: req.source_ref,
          state: 'Transferable' as SkillState,
          confidence,
          priority_score,
          provenance: `Adjacent evidence from ${bridge.source_name}: "${
            sourceEvidence.excerpt || 'Profile skill'
          }"`,
          transferable_bridge: {
            source_skill_id: bridge.source_id,
            source_skill_name: bridge.source_name,
            explanation: bridge.explanation,
            effort_level: bridge.effort,
          },
        };
      }

      // Role asks for it; evidence does not support it -> Gap
      const priority_score = Math.round(req.importance * 1.0 * 100);
      return {
        skill_id: req.skill_id,
        canonical_name: req.canonical_name,
        importance: req.importance,
        source_ref: req.source_ref,
        state: 'Gap' as SkillState,
        confidence: 0.1,
        priority_score,
        provenance: req.source_ref
          ? `Required by role: ${req.source_ref}`
          : 'Required by target role',
      };
    })
    .sort((a, b) => b.priority_score - a.priority_score);
}
