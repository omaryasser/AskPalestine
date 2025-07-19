import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  // Import only if needed
  return import("openai").then((OpenAIModule) => {
    const OpenAI = OpenAIModule.default;
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  });
}

export interface Question {
  id: string;
  question: string;
  embedding?: number[];
  metadata?: any;
}

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  content: string;
  metadata?: any;
}

export interface ProPalestinian {
  id: string;
  name: string;
  bio: string;
  photo?: string;
  professional_identity?: string;
}

export interface PaginatedQuestions {
  questions: Question[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export function initDatabase(): Database.Database {
  if (db) return db;

  db = new Database(path.join(process.cwd(), "askpalestine.db"));

  // Enable foreign key constraints
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS voices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bio TEXT NOT NULL,
      photo TEXT,
      professional_identity TEXT
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      embedding TEXT,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES voices (id) ON DELETE CASCADE
    );
  `);

  return db;
}

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Try to use OpenAI if API key is available
    const openaiModule = await getOpenAI();
    if (openaiModule) {
      console.log(
        "Generating OpenAI embedding for:",
        text.substring(0, 50) + "...",
      );
      const response = await openaiModule.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    }
  } catch (error) {
    console.warn("OpenAI embedding failed, using mock embedding:", error);
  }

  // Fallback to mock embeddings if OpenAI is not available
  console.log("Generating mock embedding for:", text.substring(0, 50) + "...");
  return new Array(1536).fill(0).map(() => Math.random());
}

export async function searchQuestions(
  query: string,
  limit: number = 5,
): Promise<
  (Question & {
    answerCount: number;
    authors: Array<{
      id: string;
      name: string;
      photo?: string;
      professional_identity?: string;
    }>;
  })[]
> {
  const database = initDatabase();
  const queryEmbedding = await getEmbedding(query);

  // Only search questions that have answers, include author information
  const stmt = database.prepare(`
    SELECT 
      q.*,
      COUNT(a.id) as answerCount,
      GROUP_CONCAT(DISTINCT p.id) as authorIds,
      GROUP_CONCAT(DISTINCT p.name) as authorNames,
      GROUP_CONCAT(DISTINCT p.photo) as authorPhotos,
      GROUP_CONCAT(DISTINCT p.professional_identity) as authorProfessionalIdentities
    FROM questions q 
    JOIN answers a ON q.id = a.question_id 
    JOIN voices p ON a.author_id = p.id
    GROUP BY q.id
  `);
  const questions = stmt.all();

  const similarities = questions.map((q: any) => {
    const embedding = q.embedding ? JSON.parse(q.embedding) : [];
    const similarity = cosineSimilarity(queryEmbedding, embedding);

    const authorIds = q.authorIds ? q.authorIds.split(",") : [];
    const authorNames = q.authorNames ? q.authorNames.split(",") : [];
    const authorPhotos = q.authorPhotos ? q.authorPhotos.split(",") : [];
    const authorProfessionalIdentities = q.authorProfessionalIdentities
      ? q.authorProfessionalIdentities.split(",")
      : [];

    const authors = authorIds.map((id: string, index: number) => ({
      id: id,
      name: authorNames[index] || "",
      photo:
        authorPhotos[index] !== "null" && authorPhotos[index]
          ? authorPhotos[index]
          : undefined,
      professional_identity:
        authorProfessionalIdentities[index] !== "null" &&
        authorProfessionalIdentities[index]
          ? authorProfessionalIdentities[index]
          : undefined,
    }));

    return {
      ...q,
      similarity,
      embedding: embedding,
      metadata: q.metadata ? JSON.parse(q.metadata) : {},
      answerCount: q.answerCount,
      authors: authors,
    };
  });

  return similarities
    .sort((a: any, b: any) => b.similarity - a.similarity)
    .slice(0, limit);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function getQuestion(id: string): Question | null {
  const database = initDatabase();
  const stmt = database.prepare("SELECT * FROM questions WHERE id = ?");
  const question = stmt.get(id) as any;

  if (!question) return null;

  return {
    ...question,
    metadata: question.metadata ? JSON.parse(question.metadata) : {},
  };
}

export function getAnswersForQuestion(
  questionId: string,
): (Answer & {
  authorName: string;
  authorPhoto?: string;
  authorProfessionalIdentity?: string;
})[] {
  const database = initDatabase();
  const stmt = database.prepare(`
    SELECT a.*, p.name as authorName, p.photo as authorPhoto, p.professional_identity as authorProfessionalIdentity 
    FROM answers a 
    JOIN voices p ON a.author_id = p.id 
    WHERE a.question_id = ?
  `);
  const answers = stmt.all(questionId) as any[];

  return answers.map((answer: any) => ({
    ...answer,
    metadata: answer.metadata ? JSON.parse(answer.metadata) : {},
  }));
}

export function getProPalestinian(id: string): ProPalestinian | null {
  const database = initDatabase();
  const stmt = database.prepare("SELECT * FROM voices WHERE id = ?");
  return stmt.get(id) as ProPalestinian | null;
}

export function getAllProPalestinians(): ProPalestinian[] {
  const database = initDatabase();
  const stmt = database.prepare("SELECT * FROM voices ORDER BY name");
  return stmt.all() as ProPalestinian[];
}

export function getAnswersByAuthor(
  authorId: string,
): (Answer & { question: string })[] {
  const database = initDatabase();
  const stmt = database.prepare(`
    SELECT a.*, q.question 
    FROM answers a 
    JOIN questions q ON a.question_id = q.id 
    WHERE a.author_id = ?
    ORDER BY a.id
  `);
  const answers = stmt.all(authorId) as any[];

  return answers.map((answer: any) => ({
    ...answer,
    metadata: answer.metadata ? JSON.parse(answer.metadata) : {},
  }));
}

export function getAllQuestions(): Question[] {
  const database = initDatabase();
  const stmt = database.prepare("SELECT * FROM questions ORDER BY question");
  const questions = stmt.all() as any[];

  return questions.map((question: any) => ({
    ...question,
    metadata: question.metadata ? JSON.parse(question.metadata) : {},
  }));
}

export function getQuestionsWithAnswers(): Question[] {
  const database = initDatabase();
  const stmt = database.prepare(`
    SELECT DISTINCT q.* 
    FROM questions q 
    JOIN answers a ON q.id = a.question_id 
    ORDER BY q.question
  `);
  const questions = stmt.all() as any[];

  return questions.map((question: any) => ({
    ...question,
    metadata: question.metadata ? JSON.parse(question.metadata) : {},
  }));
}

export function hasAnswers(questionId: string): boolean {
  const database = initDatabase();
  const stmt = database.prepare(
    "SELECT COUNT(*) as count FROM answers WHERE question_id = ?",
  );
  const result = stmt.get(questionId) as { count: number };
  return result.count > 0;
}

export function getQuestionsWithAnswersPaginated(
  page: number = 1,
  limit: number = 12,
): {
  questions: (Question & {
    answerCount: number;
    authors: Array<{
      id: string;
      name: string;
      photo?: string;
      professional_identity?: string;
    }>;
  })[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
} {
  const database = initDatabase();

  // Get total count
  const countStmt = database.prepare(`
    SELECT COUNT(DISTINCT q.id) as count 
    FROM questions q 
    JOIN answers a ON q.id = a.question_id
  `);
  const { count: totalCount } = countStmt.get() as { count: number };

  // Get paginated results with authors
  const offset = (page - 1) * limit;
  const stmt = database.prepare(`
    SELECT 
      q.*,
      COUNT(a.id) as answerCount,
      GROUP_CONCAT(DISTINCT p.id) as authorIds,
      GROUP_CONCAT(DISTINCT p.name) as authorNames,
      GROUP_CONCAT(DISTINCT p.photo) as authorPhotos,
      GROUP_CONCAT(DISTINCT p.professional_identity) as authorProfessionalIdentities
    FROM questions q 
    JOIN answers a ON q.id = a.question_id 
    JOIN voices p ON a.author_id = p.id
    GROUP BY q.id 
    ORDER BY answerCount DESC, q.question
    LIMIT ? OFFSET ?
  `);
  const questions = stmt.all(limit, offset) as any[];

  const totalPages = Math.ceil(totalCount / limit);

  return {
    questions: questions.map((question: any) => {
      const authorIds = question.authorIds ? question.authorIds.split(",") : [];
      const authorNames = question.authorNames
        ? question.authorNames.split(",")
        : [];
      const authorPhotos = question.authorPhotos
        ? question.authorPhotos.split(",")
        : [];
      const authorProfessionalIdentities = question.authorProfessionalIdentities
        ? question.authorProfessionalIdentities.split(",")
        : [];

      const authors = authorIds.map((id: string, index: number) => ({
        id: id,
        name: authorNames[index] || "",
        photo:
          authorPhotos[index] !== "null" && authorPhotos[index]
            ? authorPhotos[index]
            : undefined,
        professional_identity:
          authorProfessionalIdentities[index] !== "null" &&
          authorProfessionalIdentities[index]
            ? authorProfessionalIdentities[index]
            : undefined,
      }));

      return {
        ...question,
        metadata: question.metadata ? JSON.parse(question.metadata) : {},
        answerCount: question.answerCount,
        authors: authors,
      };
    }),
    totalCount,
    hasMore: page < totalPages,
    currentPage: page,
    totalPages,
  };
}

export function getQuestionsWithoutAnswersPaginated(
  page: number = 1,
  limit: number = 12,
): PaginatedQuestions {
  const database = initDatabase();

  // Get total count
  const countStmt = database.prepare(`
    SELECT COUNT(q.id) as count 
    FROM questions q 
    LEFT JOIN answers a ON q.id = a.question_id 
    WHERE a.question_id IS NULL
  `);
  const { count: totalCount } = countStmt.get() as { count: number };

  // Get paginated results
  const offset = (page - 1) * limit;
  const stmt = database.prepare(`
    SELECT q.* 
    FROM questions q 
    LEFT JOIN answers a ON q.id = a.question_id 
    WHERE a.question_id IS NULL
    ORDER BY q.question
    LIMIT ? OFFSET ?
  `);
  const questions = stmt.all(limit, offset) as any[];

  const totalPages = Math.ceil(totalCount / limit);

  return {
    questions: questions.map((question: any) => ({
      ...question,
      metadata: question.metadata ? JSON.parse(question.metadata) : {},
    })),
    totalCount,
    hasMore: page < totalPages,
    currentPage: page,
    totalPages,
  };
}

export function getTotalCounts() {
  const database = initDatabase();

  // Get total questions
  const totalQuestionsStmt = database.prepare(
    "SELECT COUNT(*) as count FROM questions",
  );
  const totalQuestions = (totalQuestionsStmt.get() as { count: number }).count;

  // Get total voices
  const totalProPalestiniansStmt = database.prepare(
    "SELECT COUNT(*) as count FROM voices",
  );
  const totalProPalestinians = (
    totalProPalestiniansStmt.get() as { count: number }
  ).count;

  // Get total answers
  const totalAnswersStmt = database.prepare(
    "SELECT COUNT(*) as count FROM answers",
  );
  const totalAnswers = (totalAnswersStmt.get() as { count: number }).count;

  // Get questions with answers
  const questionsWithAnswersStmt = database.prepare(`
    SELECT COUNT(DISTINCT q.id) as count 
    FROM questions q 
    JOIN answers a ON q.id = a.question_id
  `);
  const questionsWithAnswers = (
    questionsWithAnswersStmt.get() as { count: number }
  ).count;

  return {
    totalQuestions,
    totalProPalestinians,
    totalAnswers,
    questionsWithAnswers,
  };
}

export function getRandomQuestions(limit: number = 6): Question[] {
  const database = initDatabase();
  const stmt = database.prepare(`
    SELECT * FROM questions 
    ORDER BY RANDOM() 
    LIMIT ?
  `);
  const questions = stmt.all(limit) as any[];

  return questions.map((question: any) => ({
    ...question,
    metadata: question.metadata ? JSON.parse(question.metadata) : {},
  }));
}

export function getQuestionsWithMostAnswers(
  limit: number = 6,
): (Question & {
  answerCount: number;
  authors: Array<{
    id: string;
    name: string;
    photo?: string;
    professional_identity?: string;
  }>;
})[] {
  const database = initDatabase();
  const stmt = database.prepare(`
    SELECT 
      q.*,
      COUNT(a.id) as answerCount,
      GROUP_CONCAT(DISTINCT p.id) as authorIds,
      GROUP_CONCAT(DISTINCT p.name) as authorNames,
      GROUP_CONCAT(DISTINCT p.photo) as authorPhotos,
      GROUP_CONCAT(DISTINCT p.professional_identity) as authorProfessionalIdentities
    FROM questions q 
    JOIN answers a ON q.id = a.question_id 
    JOIN voices p ON a.author_id = p.id
    GROUP BY q.id 
    ORDER BY answerCount DESC, q.id
    LIMIT ?
  `);
  const questions = stmt.all(limit) as any[];

  return questions.map((question: any) => {
    const authorIds = question.authorIds ? question.authorIds.split(",") : [];
    const authorNames = question.authorNames
      ? question.authorNames.split(",")
      : [];
    const authorPhotos = question.authorPhotos
      ? question.authorPhotos.split(",")
      : [];
    const authorProfessionalIdentities = question.authorProfessionalIdentities
      ? question.authorProfessionalIdentities.split(",")
      : [];

    const authors = authorIds.map((id: string, index: number) => ({
      id: id,
      name: authorNames[index] || "",
      photo:
        authorPhotos[index] !== "null" && authorPhotos[index]
          ? authorPhotos[index]
          : undefined,
      professional_identity:
        authorProfessionalIdentities[index] !== "null" &&
        authorProfessionalIdentities[index]
          ? authorProfessionalIdentities[index]
          : undefined,
    }));

    return {
      ...question,
      metadata: question.metadata ? JSON.parse(question.metadata) : {},
      answerCount: question.answerCount,
      authors: authors,
    };
  });
}

export function getUnansweredQuestions(limit: number = 6): Question[] {
  const database = initDatabase();
  const stmt = database.prepare(`
    SELECT q.* 
    FROM questions q 
    LEFT JOIN answers a ON q.id = a.question_id 
    WHERE a.question_id IS NULL 
    ORDER BY RANDOM()
    LIMIT ?
  `);
  const questions = stmt.all(limit) as any[];

  return questions.map((question: any) => ({
    ...question,
    metadata: question.metadata ? JSON.parse(question.metadata) : {},
  }));
}
