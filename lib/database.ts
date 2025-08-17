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
    const voiceCount = newDb
      .prepare("SELECT COUNT(*) as count FROM voices")
      .get() as { count: number };

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
    database.prepare("DELETE FROM genocidal_voices").run();
    database.prepare("DELETE FROM gems").run();

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

    // Load genocidal voices
    const genocidealVoicesPath = path.join(dataPath, "genocidal-voices");
    if (fs.existsSync(genocidealVoicesPath)) {
      const genocidealVoiceDirs = fs.readdirSync(genocidealVoicesPath);
      console.log(
        `Found ${genocidealVoiceDirs.length} genocidal voices to process`,
      );

      for (const voiceDir of genocidealVoiceDirs) {
        const voicePath = path.join(genocidealVoicesPath, voiceDir);
        if (!fs.statSync(voicePath).isDirectory()) continue;

        const dataPath = path.join(voicePath, "data.json");

        if (!fs.existsSync(dataPath)) continue;

        try {
          const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

          const insertGenocidealVoice = database.prepare(
            "INSERT OR REPLACE INTO genocidal_voices (id, name, title, quotes) VALUES (?, ?, ?, ?)",
          );
          insertGenocidealVoice.run(
            voiceDir,
            data.name,
            data.title,
            JSON.stringify(data.quotes || []),
          );
        } catch (error) {
          console.warn(`Error processing genocidal voice ${voiceDir}:`, error);
        }
      }
    }

    // Load gems
    const gemsPath = path.join(dataPath, "gems");
    if (fs.existsSync(gemsPath)) {
      const gemDirs = fs.readdirSync(gemsPath);
      console.log(`Found ${gemDirs.length} gems to process`);

      for (const gemDir of gemDirs) {
        const gemPath = path.join(gemsPath, gemDir);
        if (!fs.statSync(gemPath).isDirectory()) continue;

        const dataJsonPath = path.join(gemPath, "data.json");
        if (!fs.existsSync(dataJsonPath)) continue;

        try {
          const data = JSON.parse(fs.readFileSync(dataJsonPath, "utf-8"));

          // Check for photo and copy to public folder
          const photoExtensions = [".png", ".jpg", ".jpeg", ".webp"];
          let photo = null;
          for (const ext of photoExtensions) {
            const photoPath = path.join(gemPath, `photo${ext}`);
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
                `gem-${gemDir}${ext}`,
              );
              fs.copyFileSync(photoPath, publicPhotoPath);

              // Store the correct web path for the photo
              photo = `/photos/gem-${gemDir}${ext}`;
              break;
            }
          }

          const insertGem = database.prepare(
            "INSERT OR REPLACE INTO gems (id, type, name, description, photo, sources) VALUES (?, ?, ?, ?, ?, ?)",
          );
          insertGem.run(
            gemDir,
            data.type,
            data.name,
            data.description,
            photo,
            JSON.stringify(data.sources || []),
          );
        } catch (error) {
          console.warn(`Error processing gem ${gemDir}:`, error);
        }
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

    // Convert DD-MM-YYYY to YYYY-MM-DD for proper date storage
    const convertDateFormat = (dateStr: string): string | null => {
      if (!dateStr) return null;
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY to YYYY-MM-DD
      }
      return dateStr;
    };

    // Generate embedding for all question forms combined for better search matching
    const allQuestionForms = metadata.question_forms || [];
    const combinedQuestionText = allQuestionForms.join(" | ");
    const embedding = await getEmbedding(combinedQuestionText);

    // Insert question first
    const insertQuestion = database.prepare(
      "INSERT OR REPLACE INTO questions (id, question, embedding, question_forms, created_at) VALUES (?, ?, ?, ?, ?)",
    );
    insertQuestion.run(
      questionDir,
      questionText,
      JSON.stringify(embedding),
      JSON.stringify(metadata.question_forms || []),
      convertDateFormat(metadata.created_at),
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
        let answerMetadata: any = {};
        if (fs.existsSync(answerMetadataPath)) {
          answerMetadata = JSON.parse(
            fs.readFileSync(answerMetadataPath, "utf-8"),
          );
        }

        // Insert answer with proper foreign key reference
        const insertAnswer = database.prepare(
          "INSERT OR REPLACE INTO answers (id, question_id, author_id, content, source, source_type, source_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        );
        insertAnswer.run(
          `${questionDir}-${answerDir}`,
          questionDir, // This must match the question's id
          answerDir, // This must match a voice's id
          answerContent,
          (answerMetadata as any).source || null,
          (answerMetadata as any).source_type || null,
          (answerMetadata as any).source_name || null,
          convertDateFormat((answerMetadata as any).created_at),
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
  question_forms?: string[];
  created_at?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  content: string;
  source?: string;
  source_type?: string;
  source_name?: string;
  created_at?: string;
}

export interface ProPalestinian {
  id: string;
  name: string;
  bio: string;
  photo?: string;
  professional_identity?: string;
}

export interface GenocidealVoice {
  id: string;
  name: string;
  title: string;
  quotes: {
    quote: string;
    context: string;
    sources: { name: string; link: string; date?: string }[];
  }[];
}

export interface Gem {
  id: string;
  type: string;
  name: string;
  description: string;
  photo?: string;
  sources: { name: string; link: string }[];
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
  const now = new Date();
  const readableDate = now
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .replace("Z", "");
  const ms = now.getMilliseconds();
  const dbPath = path.join(
    process.cwd(),
    `askpalestine_${readableDate}_${ms}.db`,
  );

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

    CREATE TABLE IF NOT EXISTS genocidal_voices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      quotes TEXT NOT NULL -- JSON array of quotes with context and sources
    );

    CREATE TABLE IF NOT EXISTS gems (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- e.g., "Website", "Community", "Book", "App"
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      photo TEXT,
      sources TEXT NOT NULL -- JSON array of sources with name and link
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      embedding TEXT,
      question_forms TEXT, -- JSON array of alternative question forms
      created_at DATE -- Date in YYYY-MM-DD format
    );

    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT, -- e.g., "Al Jazeera"
      source_type TEXT, -- e.g., "WEB_ARTICLE"
      source_name TEXT, -- e.g., "Middle East Monitor"
      created_at DATE, -- Date in YYYY-MM-DD format
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
      question_forms: q.question_forms ? JSON.parse(q.question_forms) : [],
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
    question_forms: question.question_forms
      ? JSON.parse(question.question_forms)
      : [],
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
    // No longer need to parse metadata since fields are separate
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
  }));
}

export async function getAllQuestions(): Promise<Question[]> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM questions ORDER BY question");
  const questions = stmt.all() as any[];

  return questions.map((question: any) => ({
    ...question,
    question_forms: question.question_forms
      ? JSON.parse(question.question_forms)
      : [],
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
    question_forms: question.question_forms
      ? JSON.parse(question.question_forms)
      : [],
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
        question_forms: question.question_forms
          ? JSON.parse(question.question_forms)
          : [],
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
      question_forms: question.question_forms
        ? JSON.parse(question.question_forms)
        : [],
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

  // Get total genocidal voices
  const totalGenocidealVoicesStmt = database.prepare(
    "SELECT COUNT(*) as count FROM genocidal_voices",
  );
  const totalGenocidealVoices = (
    totalGenocidealVoicesStmt.get() as { count: number }
  ).count;

  // Get unanswered questions count
  const totalUnansweredQuestionsStmt = database.prepare(`
    SELECT COUNT(*) as count 
    FROM questions q 
    LEFT JOIN answers a ON q.id = a.question_id 
    WHERE a.question_id IS NULL
  `);
  const totalUnansweredQuestions = (
    totalUnansweredQuestionsStmt.get() as { count: number }
  ).count;

  // Get total gems
  const totalGemsStmt = database.prepare("SELECT COUNT(*) as count FROM gems");
  const totalGems = (totalGemsStmt.get() as { count: number }).count;

  return {
    totalQuestions,
    totalProPalestinians,
    totalAnswers,
    questionsWithAnswers,
    totalGenocidealVoices,
    totalUnansweredQuestions,
    totalGems,
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
    question_forms: question.question_forms
      ? JSON.parse(question.question_forms)
      : [],
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
        authorProfessionalIdentities[index] !== "null" &&
        authorProfessionalIdentities[index]
          ? authorProfessionalIdentities[index]
          : undefined,
    }));

    return {
      ...question,
      question_forms: question.question_forms
        ? JSON.parse(question.question_forms)
        : [],
      answerCount: question.answerCount,
      authors: authors,
    };
  });
}

export async function getLatestAnsweredQuestions(limit: number = 6): Promise<
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
    ORDER BY q.created_at DESC, q.id DESC
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
      question_forms: question.question_forms
        ? JSON.parse(question.question_forms)
        : [],
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
    question_forms: question.question_forms
      ? JSON.parse(question.question_forms)
      : [],
  }));
}

export async function getLatestUnansweredQuestions(
  limit: number = 6,
): Promise<Question[]> {
  const database = await getDatabase();
  const stmt = database.prepare(`
    SELECT q.* 
    FROM questions q 
    LEFT JOIN answers a ON q.id = a.question_id 
    WHERE a.question_id IS NULL 
    ORDER BY q.created_at DESC, q.id DESC
    LIMIT ?
  `);
  const questions = stmt.all(limit) as any[];

  return questions.map((question: any) => ({
    ...question,
    question_forms: question.question_forms
      ? JSON.parse(question.question_forms)
      : [],
  }));
}

export async function getAllGenocidealVoices(): Promise<GenocidealVoice[]> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM genocidal_voices ORDER BY name");
  const voices = stmt.all() as any[];

  return voices.map((voice: any) => ({
    ...voice,
    quotes: JSON.parse(voice.quotes || "[]"),
  }));
}

export async function getGenocidealVoice(
  id: string,
): Promise<GenocidealVoice | null> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM genocidal_voices WHERE id = ?");
  const voice = stmt.get(id) as any;

  if (!voice) return null;

  return {
    ...voice,
    quotes: JSON.parse(voice.quotes || "[]"),
  };
}

export async function getRandomGenocidealVoices(
  limit: number = 6,
): Promise<GenocidealVoice[]> {
  const database = await getDatabase();
  const stmt = database.prepare(
    "SELECT * FROM genocidal_voices ORDER BY RANDOM() LIMIT ?",
  );
  const voices = stmt.all(limit) as any[];

  return voices.map((voice: any) => ({
    ...voice,
    quotes: JSON.parse(voice.quotes || "[]"),
  }));
}

export async function getAllGems(): Promise<Gem[]> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM gems ORDER BY name");
  const gems = stmt.all() as any[];

  return gems.map((gem: any) => ({
    ...gem,
    sources: JSON.parse(gem.sources || "[]"),
  }));
}

export async function getGem(id: string): Promise<Gem | null> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM gems WHERE id = ?");
  const gem = stmt.get(id) as any;

  if (!gem) return null;

  return {
    ...gem,
    sources: JSON.parse(gem.sources || "[]"),
  };
}

export async function getRandomGems(limit: number = 6): Promise<Gem[]> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM gems ORDER BY RANDOM() LIMIT ?");
  const gems = stmt.all(limit) as any[];

  return gems.map((gem: any) => ({
    ...gem,
    sources: JSON.parse(gem.sources || "[]"),
  }));
}

export async function getGemsByType(type: string): Promise<Gem[]> {
  const database = await getDatabase();
  const stmt = database.prepare(
    "SELECT * FROM gems WHERE type = ? ORDER BY name",
  );
  const gems = stmt.all(type) as any[];

  return gems.map((gem: any) => ({
    ...gem,
    sources: JSON.parse(gem.sources || "[]"),
  }));
}
