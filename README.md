# 📄 ASK MY PDF

An AI-powered application that allows users to upload PDFs and ask questions based on their content. The system processes documents, stores embeddings, and retrieves the most relevant context to generate accurate answers.

## 🚀 What This Application Does

ASKMYPDF helps users interact with PDF documents like ChatGPT.

- 👉 Upload a PDF
- 👉 Ask questions
- 👉 Get precise answers based only on that PDF

## ❓ Problem It Solves

Reading large PDFs is time-consuming and inefficient.

This application solves that by:

- Converting PDF into structured text
- Breaking it into smaller chunks
- Creating vector embeddings for semantic search
- Retrieving only the most relevant content
- Generating answers using AI

✅ Result:

- Less token usage
- Faster responses
- More accurate answers

### ⚙️ How It Works (Architecture)

1. PDF Upload
   User uploads PDF via frontend
   Backend stores file locally
   Job is pushed to BullMQ queue
2. Background Processing (Worker)
   Worker picks job from queue
   Loads PDF using PDFLoader
   Splits text into chunks
   Converts chunks into embeddings
   Stores embeddings in Qdrant vector DB
3. Query Handling
   User sends question
   Question is converted into embedding
   Top 2 nearest chunks are retrieved
   Context is sent to Gemini AI
   AI generates final answer

## 🏗️ Tech Stack

### Frontend

- Next.js
- React

### Backend

- Node.js
- Express

### AI & Processing

- Google Gemini API
- LangChain

### other tools

- Vector Database
- Qdrant
- Queue System
- BullMQ + Valkey (Redis alternative)

### Deployment

- Docker
- AWS EC2

## 🐳 Docker Architecture

This project uses Docker Compose to run all services together in isolated containers.

### ⚙️ Services

- valkey → Queue system (Redis for BullMQ)
- qdrant → Vector database
- frontend → Next.js UI
- api → Express backend
- worker → Background PDF processor

### 🧠 How It Works

- Each service is defined in docker-compose.yml
- build: ./client and build: ./server tell Docker to use the respective Dockerfiles
- Docker builds images and starts containers for all services

### 🚀 Run Project

docker compose up -d --build

## ☁️ AWS Deployment

The application is deployed on AWS EC2 using Docker and Docker Compose.

### 👉 For detailed step-by-step setup, refer to:

📄 [AWS Deployment Guide](./AWS_DEPLOYMENT.md)

### 🧠 Deployment Overview

- EC2 instance is used as the server
- Docker is installed to containerize services
- docker-compose.yml is used to run all services together
- Application is exposed via public IPv4 address

### ⚠️ Challenges Faced

1. Low Memory Issue (EC2 Free Tier)
   Docker containers + AI processing required more RAM
   Application was crashing due to out-of-memory errors

### 🛠️ Solution: Swap Memory

Swap memory acts as virtual RAM using disk space.

- 👉 When RAM is full:

Inactive processes are moved to disk (swap)
Frees actual RAM for active tasks

✅ Result:

- Prevented crashes
- Enabled smooth Docker execution on low-memory instance

### 🚀 Advantage of Docker Compose

Using docker-compose.yml provides:

- One-command deployment

- docker compose up -d --build
- Automatically builds and runs all services
- Handles networking between containers
- Simplifies deployment and scaling
