import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const pinecone = new PineconeClient();

async function initVectorStore() {
  try {
    console.log("Connecting to Pinecone...");

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const store = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });

    console.log("Vector store loaded successfully!");
    return store;
  } catch (err) {
    console.error("Failed to initialize vector store:", err);
    throw err;
  }
}

export const vectorStore = await initVectorStore();

export async function indexTheDocument(filePath) {
  const loader = new PDFLoader(filePath, { splitPages: false });
  const doc = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const chunks = await splitter.splitText(doc[0].pageContent);
  const docs = chunks.map((chunk) => ({
    pageContent: chunk,
    metadata: doc[0].metadata,
  }));

  console.log("Storing chunks in vector store...");
  await vectorStore.addDocuments(docs);
  console.log("Document successfully stored.");
}
