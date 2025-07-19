import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { Mutex } from "async-mutex";

// Global singleton pattern to persist across hot reloads in development
declare global {
  var __askpalestine_db: Database.Database | undefined;
  var __askpalestine_mutex: Mutex | undefined;
}

// Use global variables to persist across hot reloads
const getDbInstance = () => global.__askpalestine_db;
const setDbInstance = (database: Database.Database) => {
  global.__askpalestine_db = database;
};

const getMutex = () => {
  if (!global.__askpalestine_mutex) {
    global.__askpalestine_mutex = new Mutex();
  }
  return global.__askpalestine_mutex;
};

// Function to get database instance (ensuring it's initialized and data is loaded)
export async function getDatabase(): Promise<Database.Database> {
  // Use mutex to ensure only one initialization happens at a time
  return await getMutex().runExclusive(async () => {
    // If database is already initialized, return it
    const existingDb = getDbInstance();
    if (existingDb) {
      console.log("🔗 Reusing existing database connection");
      return existingDb;
    }

    console.log("🔗 Initializing new database connection...");
    // Initialize database and load data
    const newDb = initDatabase();
    
    // Check if database already has data (to avoid reloading)
    const voiceCount = newDb.prepare("SELECT COUNT(*) as count FROM voices").get() as { count: number };
    
    if (voiceCount.count === 0) {
      console.log("🗄️ Loading data from files...");
      await loadDataToDatabase(newDb);
      console.log("✅ Database data loaded successfully");
    } else {
      console.log("✅ Database already contains data, skipping reload");
    }

    return newDb;
  });
}

// Data loading functionality (moved from data-loader.ts to avoid circular dependency)
async function loadDataToDatabase(database: Database.Database): Promise<void> {
  const dataPath = path.join(process.cwd(), "data");
  console.log("Starting data loading process...");

  // Enable foreign key constraints
  database.pragma("foreign_keys = ON");

  // Use a transaction to ensure data integrity
  const loadData = database.transaction(() => {
    // Clear existing data in correct order (answers first due to foreign key)
    database.prepare("DELETE FROM answers").run();
    database.prepare("DELETE FROM questions").run();
    database.prepare("DELETE FROM voices").run();

    // FIRST: Load voices (they must exist before answers can reference them)
    const proPalestiniansPath = path.join(dataPath, "voices");
    if (fs.existsSync(proPalestiniansPath)) {
      const proPalestinianDirs = fs.readdirSync(proPalestiniansPath);
      console.log(`Found ${proPalestinianDirs.length} voices to process`);

      for (const proPalestinianDir of proPalestinianDirs) {
        const proPalestinianPath = path.join(
          proPalestiniansPath,
          proPalestinianDir,
        );
        if (!fs.statSync(proPalestinianPath).isDirectory()) continue;

        const bioPath = path.join(proPalestinianPath, "bio.md");
        if (!fs.existsSync(bioPath)) continue;

        const bio = fs.readFileSync(bioPath, "utf-8");

        // Read metadata for professional identity
        const metadataPath = path.join(proPalestinianPath, "metadata.json");
        let professional_identity = null;
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
            professional_identity = metadata.professional_identity || null;
          } catch (error) {
            console.warn(
              `Error reading metadata for ${proPalestinianDir}:`,
              error,
            );
          }
        }

        // Check for photo and copy to public folder
        const photoExtensions = [".png", ".jpg", ".jpeg", ".webp"];
        let photo = null;
        for (const ext of photoExtensions) {
          const photoPath = path.join(proPalestinianPath, `photo${ext}`);
          if (fs.existsSync(photoPath)) {
            // Create public/photos directory if it doesn't exist
            const publicPhotosDir = path.join(
              process.cwd(),
              "public",
              "photos",
            );
            if (!fs.existsSync(publicPhotosDir)) {
              fs.mkdirSync(publicPhotosDir, { recursive: true });
            }

            // Copy photo to public folder with ID-based name
            const publicPhotoPath = path.join(
              publicPhotosDir,
              `${proPalestinianDir}${ext}`,
            );
            fs.copyFileSync(photoPath, publicPhotoPath);

            // Store the correct web path for the photo
            photo = `/photos/${proPalestinianDir}${ext}`;
            break;
          }
        }

        const insertProPalestinian = database.prepare(
          "INSERT OR REPLACE INTO voices (id, name, bio, photo, professional_identity) VALUES (?, ?, ?, ?, ?)",
        );
        insertProPalestinian.run(
          proPalestinianDir,
          proPalestinianDir,
          bio,
          photo,
          professional_identity,
        );
      }
    }
  });

  // Execute the synchronous part of data loading
  loadData();

  // SECOND: Load questions and answers (this needs to be async due to embeddings)
  const questionsPath = path.join(dataPath, "questions");
  const questionDirs = fs.readdirSync(questionsPath);
  console.log(`Found ${questionDirs.length} questions to process`);

  for (const questionDir of questionDirs) {
    const questionPath = path.join(questionsPath, questionDir);
    if (!fs.statSync(questionPath).isDirectory()) continue;

    // Read metadata (required now)
    const metadataPath = path.join(questionPath, "metadata.json");
    if (!fs.existsSync(metadataPath)) {
      console.warn(`Skipping ${questionDir} - no metadata.json file`);
      continue;
    }

    let metadata: any = {};
    try {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    } catch (error) {
      console.warn(`Error reading metadata for ${questionDir}:`, error);
      continue;
    }

    // Get question text from first element of question_forms
    const questionText = metadata.question_forms?.[0];
    if (!questionText) {
      console.warn(`Skipping ${questionDir} - no question forms in metadata`);
      continue;
    }

    console.log(`Processing: ${questionText}`);

    // Generate embedding for all question forms combined for better search matching
    const allQuestionForms = metadata.question_forms || [];
    const combinedQuestionText = allQuestionForms.join(" | ");
    const embedding = await getEmbedding(combinedQuestionText);

    // Insert question first
    const insertQuestion = database.prepare(
      "INSERT OR REPLACE INTO questions (id, question, embedding, metadata) VALUES (?, ?, ?, ?)",
    );
    insertQuestion.run(
      questionDir,
      questionText,
      JSON.stringify(embedding),
      JSON.stringify(metadata),
    );

    // Load answers (only if answers directory exists)
    const answersPath = path.join(questionPath, "answers");
    if (fs.existsSync(answersPath)) {
      const answerDirs = fs.readdirSync(answersPath);

      for (const answerDir of answerDirs) {
        const answerPath = path.join(answersPath, answerDir);
        if (!fs.statSync(answerPath).isDirectory()) continue;

        const answerTextPath = path.join(answerPath, "text.md");
        if (!fs.existsSync(answerTextPath)) continue;

        const answerContent = fs.readFileSync(answerTextPath, "utf-8");

        // Read answer metadata
        const answerMetadataPath = path.join(answerPath, "metadata.json");
        let answerMetadata = {};
        if (fs.existsSync(answerMetadataPath)) {
          answerMetadata = JSON.parse(
            fs.readFileSync(answerMetadataPath, "utf-8"),
          );
        }

        // Insert answer with proper foreign key reference
        const insertAnswer = database.prepare(
          "INSERT OR REPLACE INTO answers (id, question_id, author_id, content, metadata) VALUES (?, ?, ?, ?, ?)",
        );
        insertAnswer.run(
          `${questionDir}-${answerDir}`,
          questionDir, // This must match the question's id
          answerDir, // This must match a voice's id
          answerContent,
          JSON.stringify(answerMetadata),
        );
      }
    }
  }

  console.log("Database loaded successfully");
}

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
  console.log("🔗 Initializing database connection...");
  const existingDb = getDbInstance();
  if (existingDb) return existingDb;
  
  console.log("📂 Setting up database path...");
  const dbPath = path.join(process.cwd(), "askpalestine.db");

  // Always delete existing database file if it exists
  if (fs.existsSync(dbPath)) {
    try {
      console.log("�️ Deleting existing database file...");
      fs.chmodSync(dbPath, 0o666);
      fs.unlinkSync(dbPath);
    } catch (error) {
      console.warn("Warning: Could not delete existing database file:", error);
      // Continue anyway - maybe we can still use it
    }
  }

  console.log("🆕 Creating new database...");

  // Ensure the directory is writable
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true, mode: 0o755 });
  }

  let newDb: Database.Database;
  try {
    // Create database with explicit options to ensure it's writable
    newDb = new Database(dbPath, {
      verbose: console.log,
      fileMustExist: false,
      readonly: false,
    });

    // Make sure the database file is writable
    fs.chmodSync(dbPath, 0o666);
  } catch (error) {
    console.error("Failed to create database:", error);
    throw error;
  }

  // Enable foreign key constraints
  newDb.pragma("foreign_keys = ON");

  newDb.exec(`
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

  // Store in global singleton
  setDbInstance(newDb);
  return newDb;
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
  const database = await getDatabase();
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

export async function getQuestion(id: string): Promise<Question | null> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM questions WHERE id = ?");
  const question = stmt.get(id) as any;

  if (!question) return null;

  return {
    ...question,
    metadata: question.metadata ? JSON.parse(question.metadata) : {},
  };
}

export async function getAnswersForQuestion(questionId: string): Promise<
  (Answer & {
    authorName: string;
    authorPhoto?: string;
    authorProfessionalIdentity?: string;
  })[]
> {
  const database = await getDatabase();
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

export async function getProPalestinian(
  id: string,
): Promise<ProPalestinian | null> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM voices WHERE id = ?");
  return stmt.get(id) as ProPalestinian | null;
}

export async function getAllProPalestinians(): Promise<ProPalestinian[]> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM voices ORDER BY name");
  return stmt.all() as ProPalestinian[];
}

export async function getAnswersByAuthor(
  authorId: string,
): Promise<(Answer & { question: string })[]> {
  const database = await getDatabase();
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

export async function getAllQuestions(): Promise<Question[]> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM questions ORDER BY question");
  const questions = stmt.all() as any[];

  return questions.map((question: any) => ({
    ...question,
    metadata: question.metadata ? JSON.parse(question.metadata) : {},
  }));
}

export async function getQuestionsWithAnswers(): Promise<Question[]> {
  const database = await getDatabase();
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

export async function hasAnswers(questionId: string): Promise<boolean> {
  const database = await getDatabase();
  const stmt = database.prepare(
    "SELECT COUNT(*) as count FROM answers WHERE question_id = ?",
  );
  const result = stmt.get(questionId) as { count: number };
  return result.count > 0;
}

export async function getQuestionsWithAnswersPaginated(
  page: number = 1,
  limit: number = 12,
): Promise<{
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
}> {
  const database = await getDatabase();

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

export async function getQuestionsWithoutAnswersPaginated(
  page: number = 1,
  limit: number = 12,
): Promise<PaginatedQuestions> {
  const database = await getDatabase();

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

export async function getTotalCounts() {
  const database = await getDatabase();

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

export async function getRandomQuestions(
  limit: number = 6,
): Promise<Question[]> {
  const database = await getDatabase();
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

export async function getQuestionsWithMostAnswers(limit: number = 6): Promise<
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
  const database = await getDatabase();
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

export async function getUnansweredQuestions(
  limit: number = 6,
): Promise<Question[]> {
  const database = await getDatabase();
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
