import fs from "fs";
import path from "path";
import { initDatabase, getEmbedding } from "./database";

export interface QuestionData {
  id: string;
  question: string;
  metadata: any;
  answers: AnswerData[];
}

export interface AnswerData {
  id: string;
  authorId: string;
  content: string;
  metadata: any;
}

export interface ProPalestinianData {
  id: string;
  name: string;
  bio: string;
  photo?: string;
  professional_identity?: string;
}

export async function loadDataToDatabase() {
  const database = initDatabase();
  const dataPath = path.join(process.cwd(), "data");

  console.log("Starting data loading process...");

  // Enable foreign key constraints
  database.pragma("foreign_keys = ON");

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
          const publicPhotosDir = path.join(process.cwd(), "public", "photos");
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

  // SECOND: Load questions and answers
  const questionsPath = path.join(dataPath, "questions");
  const questionDirs = fs.readdirSync(questionsPath);

  console.log(`Found ${questionDirs.length} questions to process`);

  for (const questionDir of questionDirs) {
    console.log(`Processing question directory: ${questionDir}`);
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
