import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { QdrantClient } from "@qdrant/js-client-rest";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log("jobs:", job.data);
    const data = JSON.parse(job.data);
    // load the file
    const loader = new PDFLoader(data.path, {
      // splitPages: true,
      // This uses the built-in version that avoids the 'exports' error
      pdfjs: () => import("pdfjs-dist/legacy/build/pdf.mjs"),
    });
    try {
      const docs = await loader.load();
      console.log("Successfully loaded docs:", docs.length);

      // this is to break the pdf into chunks
      const textsplitters = new RecursiveCharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 10,
        separators: ["\n\n", " "],
      });

      const texts = await textsplitters.splitDocuments(docs);
      console.log("Split into chunks:", texts.length);
      console.log("Split into chunks:", texts);

      // quadrant is used for vector embedding
      // https://docs.langchain.com/oss/javascript/integrations/vectorstores/qdrant

      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: "AIzaSyA4znAo0FxJO0ZHJGoqDJqPGFRWc6z3Pfc", // Your Gemini Key
        // https://docs.langchain.com/oss/python/integrations/embeddings/google_generative_ai --> docs for model
        model: "gemini-embedding-2-preview", // Latest stable embedding model
        outputDimensionality: 768,
        taskType: TaskType.RETRIEVAL_DOCUMENT,
      });

      const vectorStore = await QdrantVectorStore.fromDocuments(
        texts,
        embeddings,
        {
          url: "http://127.0.0.1:6333",
          collectionName: "pdf-chunks",
        },
      );

      console.log("all docs are stored to vector store");
    } catch (error) {
      console.error("Failed to process PDF:", error);
    }
  },
  {
    concurrency: 100,
    connection: { host: "localhost", port: 6379 },
  },
);
