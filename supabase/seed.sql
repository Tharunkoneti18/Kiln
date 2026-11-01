-- Career OS Seed Data (O*NET taxonomy skills, curated roles, and initial lessons)

-- Baseline Skills
INSERT INTO public.skills (id, canonical_name, taxonomy, taxonomy_id, aliases)
VALUES
  ('sql', 'SQL (Structured Query Language)', 'onet', '15-1251.00', ARRAY['PostgreSQL', 'MySQL', 'Relational Databases', 'Queries']),
  ('python', 'Python Programming', 'onet', '15-1251.00', ARRAY['Python 3', 'Data Scripting', 'Pandas']),
  ('data-modeling', 'Data Modeling', 'onet', '15-1251.00', ARRAY['ER Diagrams', 'Database Schema Design', 'Normalization']),
  ('data-visualization', 'Data Visualization', 'onet', '15-2051.01', ARRAY['Tableau', 'Power BI', 'Dashboarding', 'Charts']),
  ('data-communication', 'Technical & Data Communication', 'onet', '15-2051.00', ARRAY['Stakeholder Presentation', 'Insights Reporting']),
  ('spreadsheets', 'Advanced Spreadsheets', 'onet', '43-9022.00', ARRAY['Excel', 'Google Sheets', 'VLOOKUP', 'Pivot Tables'])
ON CONFLICT (id) DO NOTHING;

-- Curated Published Lesson Fixture (for Part B integration handoff)
INSERT INTO public.lessons (id, slug, version, title, objective, estimated_seconds, skill_ids, status, duration_minutes, manifest_json)
VALUES
  (
    'sql-joins-v1',
    'mastering-sql-joins',
    1,
    'Mastering SQL Joins & Relational Analysis',
    'Understand INNER, LEFT, RIGHT, and FULL joins through visual set theory and interactive queries.',
    1800,
    ARRAY['sql', 'data-modeling'],
    'published',
    30,
    '{
      "lesson_id": "sql-joins-v1",
      "version": 1,
      "title": "Mastering SQL Joins & Relational Analysis",
      "objective": "Understand INNER, LEFT, RIGHT, and FULL joins through visual set theory and interactive queries.",
      "estimated_seconds": 1800,
      "skill_ids": ["sql", "data-modeling"],
      "segments": [
        {
          "segment_id": "seg_intro",
          "title": "Why Relational Joins Matter",
          "narration_text": "Welcome to SQL Joins. In relational databases, data lives in normalized tables. Today we connect them.",
          "duration_ms": 60000,
          "board_events": [
            {
              "event_id": "e1",
              "segment_id": "seg_intro",
              "offset_ms": 2000,
              "type": "text",
              "payload": { "x": 0.1, "y": 0.2, "text": "Table A ⨝ Table B", "font_scale": 0.05 },
              "accessible_text": "Visualizing Table A joined with Table B"
            }
          ]
        }
      ],
      "quiz": [
        {
          "question_id": "q1",
          "prompt": "Which JOIN returns all rows from the left table even if no match exists in the right table?",
          "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"],
          "correct_option_index": 1,
          "explanation": "LEFT JOIN preserves every row from the left table, populating NULL for missing right-side values."
        }
      ]
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
