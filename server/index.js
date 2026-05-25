import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { TaskType } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

import { Queue } from "bullmq";

const queue = new Queue("file-upload-queue", {
  connection: {
    host: process.env.REDIS_HOST || "valkey",
    port: process.env.REDIS_PORT || 6379,
  },
});

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get("/", async (req, res) => {
  console.log("i am getiing");
  res.json({ mssg: "app is getting" });
});

app.post("/upload/pdf", upload.single("pdf"), async function (req, res, next) {
  const email = req.body.email;
  console.log(email);
  console.log("question reached");
  await queue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
      email,
    }),
  );
  res.json({ mssg: "pdf uploaded" });
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/chat", async (req, res) => {
  try {
    const userquery = req.query.message;
    const email = req.query.email;
    console.log(userquery);
    console.log(email);

    if (!userquery || typeof userquery !== "string") {
      return res.status(400).json({
        error: "Message is required and must be a string.",
      });
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY, // Your Gemini Key
      model: "gemini-embedding-2-preview", // Latest stable embedding model
      taskType: TaskType.RETRIEVAL_QUERY,
    });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL || "http://qdrant:6333",
        collectionName: "pdf-chunks",
      },
    );

    console.log("Retriever started");
    const ret = vectorStore.asRetriever({
      k: 2,

      filter: {
        must: [
          {
            key: "metadata.userEmail",
            match: {
              value: email,
            },
          },
        ],
      },
    });

    // const ret = vectorStore.asRetriever({
    //   k: 2,
    // });
    console.log("Retriever initialized successfully");
    const result = await ret.invoke(userquery);
    console.log("relevent context ", result);

    if (!result || result.length === 0) {
      return res.json({
        messages:
          "No documents found for this user. Please upload a PDF first.",
        docs: [],
      });
    }

    const systemprompt = `
You are a helpful AI assistant.

Answer the user's question ONLY using the provided PDF context.

Rules:
- If the answer exists in the context, answer clearly and concisely.
- If the question is unrelated to the PDF context, reply:
  "Your question is not related to the uploaded PDF."
- Do not make up answers.
- Do not use outside knowledge.
- If context is insufficient, say:
  "I could not find the answer in the uploaded PDF."

PDF Context:
${JSON.stringify(result)}
`;

    const ans = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "system", text: systemprompt },
        { role: "user", text: userquery },
      ],
    });

    console.log("final answer is ", ans);

    return res.json({ messages: ans.text, docs: result });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.listen(8000, () => {
  console.log("server is listened at port 8000");
});
