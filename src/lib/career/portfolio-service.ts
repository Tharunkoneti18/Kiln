export interface PortfolioArtifactInput {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  uri: string;
  skill_ids: string[];
  rubric?: Record<string, unknown>;
  visibility?: 'private' | 'shared';
  verified_state?: 'self_reported' | 'demonstrated' | 'assessed';
}

export const sampleArtifacts: PortfolioArtifactInput[] = [
  {
    id: 'art_ecommerce_sql',
    userId: 'anonymous_user',
    title: 'E-Commerce SQL Retention Analysis Script & Summary',
    description: 'PostgreSQL queries computing 12-month cohort retention and lifetime value.',
    uri: 'https://github.com/example/ecommerce-retention-sql',
    skill_ids: ['sql', 'data-modeling'],
    visibility: 'private',
    verified_state: 'demonstrated',
  },
];
