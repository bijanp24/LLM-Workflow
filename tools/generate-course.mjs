#!/usr/bin/env node
// Generate a new LLM Academy course from seed material using Claude, then
// write the course files (course.json + docs/*.md + quizzes/*.json) and
// register the course in the root catalog.json.
//
// This script does the deterministic file scaffolding; Claude writes the prose
// and assessments. A human reviews the result via the PR opened by the workflow.
//
// Inputs (env):
//   ANTHROPIC_API_KEY   required — the API key for Claude.
//   ANTHROPIC_MODEL     optional — defaults to claude-opus-4-8.
//   SEED_PAYLOAD_FILE   optional — path to a JSON file with the dispatch payload:
//                       { source_repo, source_ref, sha, seed_type, seed_title, seed_content }
//   SEED_TITLE / SEED_CONTENT / SOURCE_REPO / SEED_TYPE
//                       optional — used when SEED_PAYLOAD_FILE is absent.
//   GITHUB_OUTPUT       optional — when set (in CI), course_id/course_title/branch are written here.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

function die(msg) {
  console.error(`generate-course: ${msg}`);
  process.exit(1);
}

export function slugify(s) {
  return (
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'course'
  );
}

// ---- JSON schema Claude must conform to ------------------------------------

export const COURSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'lessons'],
  properties: {
    title: { type: 'string', description: 'Course title (concise, no marketing fluff).' },
    description: { type: 'string', description: 'One- or two-sentence catalog blurb.' },
    lessons: {
      type: 'array',
      description: '3 to 5 lessons, ordered from foundational to advanced.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'doc_markdown', 'questions'],
        properties: {
          title: { type: 'string' },
          doc_markdown: {
            type: 'string',
            description:
              'Full lesson body in GitHub-flavored Markdown. Use headings, prose, examples, and fenced code blocks. May use mermaid diagrams. Do not include front-matter.',
          },
          questions: {
            type: 'array',
            description: '2 to 5 assessment questions. May be empty for a purely narrative lesson.',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['type', 'prompt', 'options', 'answer_index', 'answer_bool', 'explanation'],
              properties: {
                type: { type: 'string', enum: ['multiple-choice', 'true-false'] },
                prompt: { type: 'string' },
                options: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'For multiple-choice: 3-4 options. For true-false: empty array.',
                },
                answer_index: {
                  type: 'integer',
                  description: 'For multiple-choice: 0-based index of the correct option. For true-false: -1.',
                },
                answer_bool: {
                  type: 'boolean',
                  description: 'For true-false: the correct answer. For multiple-choice: false (ignored).',
                },
                explanation: { type: 'string', description: 'Why the answer is correct.' },
              },
            },
          },
        },
      },
    },
  },
};

// ---- Deterministic writer (pure-ish; unit-testable offline) -----------------

/**
 * Write a generated course to disk and register it in catalog.json.
 * @param {object} course  the model output conforming to COURSE_SCHEMA
 * @param {string} repoRoot  content repo root (contains catalog.json)
 * @returns {{courseId:string, branch:string, lessonCount:number, hasAnyQuiz:boolean}}
 */
export function writeCourse(course, repoRoot = REPO_ROOT) {
  if (!course || !course.title || !Array.isArray(course.lessons) || course.lessons.length === 0) {
    throw new Error('course is missing title or lessons');
  }

  const catalogPath = path.join(repoRoot, 'catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const existingIds = new Set(catalog.courses.map((c) => c.id));

  let courseId = slugify(course.title);
  let suffix = 2;
  while (existingIds.has(courseId) || fs.existsSync(path.join(repoRoot, courseId))) {
    courseId = `${slugify(course.title)}-${suffix++}`;
  }

  const courseDir = path.join(repoRoot, courseId);
  fs.mkdirSync(path.join(courseDir, 'docs'), { recursive: true });

  const manifestLessons = [];
  let hasAnyQuiz = false;

  course.lessons.forEach((lesson, i) => {
    const nn = String(i + 1).padStart(2, '0');
    const lessonSlug = slugify(lesson.title);
    const docRel = `${courseId}/docs/${nn}-${lessonSlug}.md`;

    let md = String(lesson.doc_markdown || '').trim();
    if (!md.startsWith('# ')) md = `# ${lesson.title}\n\n${md}`;
    fs.writeFileSync(path.join(repoRoot, docRel), md + '\n');

    let quizRel = null;
    const questions = Array.isArray(lesson.questions) ? lesson.questions : [];
    if (questions.length > 0) {
      hasAnyQuiz = true;
      quizRel = `${courseId}/quizzes/${nn}-${lessonSlug}.json`;
      const quiz = {
        id: lessonSlug,
        title: `${lesson.title} — Check`,
        passingScore: 0.7,
        questions: questions.map((q, qi) => {
          const base = { id: `q${qi + 1}`, type: q.type, prompt: q.prompt, explanation: q.explanation };
          return q.type === 'true-false'
            ? { ...base, answer: q.answer_bool }
            : { ...base, options: q.options, answer: q.answer_index };
        }),
      };
      fs.mkdirSync(path.join(courseDir, 'quizzes'), { recursive: true });
      fs.writeFileSync(path.join(repoRoot, quizRel), JSON.stringify(quiz, null, 2) + '\n');
    }

    manifestLessons.push({ id: lessonSlug, title: lesson.title, doc: docRel, quiz: quizRel });
  });

  const manifest = {
    id: courseId,
    title: course.title,
    description: course.description,
    version: '1.0.0',
    lessons: manifestLessons,
  };
  fs.writeFileSync(path.join(courseDir, 'course.json'), JSON.stringify(manifest, null, 2) + '\n');

  catalog.courses.push({
    id: courseId,
    title: course.title,
    description: course.description,
    manifest: `${courseId}/course.json`,
  });
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');

  return { courseId, branch: `course/${courseId}`, lessonCount: manifestLessons.length, hasAnyQuiz };
}

// ---- Seed loading -----------------------------------------------------------

function loadSeed() {
  const file = process.env.SEED_PAYLOAD_FILE;
  if (file && fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      die(`could not parse SEED_PAYLOAD_FILE (${file}): ${e.message}`);
    }
  }
  return {
    source_repo: process.env.SOURCE_REPO || 'unknown-repo',
    source_ref: process.env.SOURCE_REF || '',
    sha: process.env.SHA || '',
    seed_type: process.env.SEED_TYPE || 'lesson-export',
    seed_title: process.env.SEED_TITLE || '',
    seed_content: process.env.SEED_CONTENT || '',
  };
}

// ---- Main (only when run directly) -----------------------------------------

async function main() {
  const seed = loadSeed();
  if (!seed.seed_content || !seed.seed_content.trim()) {
    die('no seed_content provided — nothing to generate a course from.');
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    die('ANTHROPIC_API_KEY is not set.');
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const catalog = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'catalog.json'), 'utf8'));
  const existingTitles = catalog.courses.map((c) => `- ${c.title}: ${c.description}`).join('\n');

  const system = `You are a curriculum author for the LLM Academy, a free, self-paced LMS that teaches people how to work effectively and safely with software, AI, and the systems built around them.

Write one new, self-contained course derived from the seed material provided by the user. The seed comes from a real software project that was just deployed; turn what was built (or the notes the author wrote) into a genuinely useful, example-driven lesson sequence.

Quality bar:
- Concrete and example-driven, not generic. Prefer real mechanisms, code, and trade-offs over platitudes.
- Each lesson is a complete Markdown document: clear headings, prose that explains the "why", and fenced code blocks where they help.
- Calm, sober, technically credible tone. No hype, no emoji-spam.
- Assessments test understanding, not recall of trivia.

Do NOT duplicate or substantially overlap an existing course. The current catalog is:
${existingTitles}

Pick a distinct angle. Output must conform exactly to the provided JSON schema.`;

  const user = `Seed source: ${seed.source_repo}${seed.sha ? ` @ ${String(seed.sha).slice(0, 12)}` : ''} (type: ${seed.seed_type})
${seed.seed_title ? `Suggested topic: ${seed.seed_title}\n` : ''}
Seed material:
"""
${seed.seed_content.slice(0, 40000)}
"""

Author the course now.`;

  const client = new Anthropic();
  console.log(`generate-course: calling ${MODEL} …`);
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'high',
      format: { type: 'json_schema', schema: COURSE_SCHEMA },
    },
    system,
    messages: [{ role: 'user', content: user }],
  });

  const message = await stream.finalMessage();
  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock) die('model returned no text content.');

  let course;
  try {
    course = JSON.parse(textBlock.text);
  } catch (e) {
    die(`model output was not valid JSON: ${e.message}\n--- output ---\n${textBlock.text.slice(0, 2000)}`);
  }

  let result;
  try {
    result = writeCourse(course, REPO_ROOT);
  } catch (e) {
    die(e.message);
  }

  console.log(
    `generate-course: wrote course "${course.title}" (${result.courseId}) — ${result.lessonCount} lessons, quizzes: ${result.hasAnyQuiz}`,
  );

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `course_id=${result.courseId}\ncourse_title=${course.title}\nbranch=${result.branch}\nlesson_count=${result.lessonCount}\n`,
    );
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
