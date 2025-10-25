SCREENSHOTS



<img width="1920" height="1080" alt="Screenshot (9)" src="https://github.com/user-attachments/assets/ad9173d8-0ee3-48fa-92cc-931a9734214e" />
<img width="1920" height="1080" alt="Screenshot (8)" src="https://github.com/user-attachments/assets/ece7f99e-44fb-4afc-9f04-858369001bc2" />
<img width="1920" height="1080" alt="Screenshot (7)" src="https://github.com/user-attachments/assets/55f0ca0c-2957-4005-a583-f49d7505e81a" />


<img width="1920" height="1080" alt="Screenshot (6)" src="https://github.com/user-attachments/assets/d1d23cee-f739-48e4-a02d-e8d11df5840a" />
<img width="1920" height="1080" alt="Screenshot (10)" src="https://github.com/user-attachments/assets/b3c8d0a5-bfad-4407-98eb-73c067b811ba" />

<img width="1920" height="1080" alt="Screenshot (12)" src="https://github.com/user-attachments/assets/bd908f53-5321-4f41-9c36-ca60d6aac078" />


# 🔐 Encrypted Personal Storage Vault (EPSV)

<img width="1024" height="1024" alt="epsv" src="https://github.com/user-attachments/assets/b1f5347c-044f-40dc-9302-4837dd66a9e4" />

---

## Overview

The **Encrypted Personal Storage Vault (EPSV)** is a decentralized, user-controlled storage system built on the **OG Chain ecosystem**.
It empowers individuals and organizations to store, access, and intelligently manage **sensitive data (documents, contracts, IDs, credentials, etc.)** with strong encryption, **AI assistance**, and **privacy guarantees** — powered by **OG Storage** and **OG Inference**.

EPSV combines **end-to-end encryption**, **on-chain access control**, and **decentralized AI inference** to ensure data is always:

* **Secure** (AES-GCM client-side encryption, key isolation)
* **Private** (no unencrypted data leaves the device)
* **Intelligent** (privacy-safe AI tagging, summaries, and vault suggestions)
* **Decentralized** (stored and verifiable on OG Storage)

---

## Core Features

### 🔐 1. End-to-End Encryption

* Every file is encrypted **client-side** with AES-GCM before upload.
* Only the vault owner holds the decryption key — not even the network nodes can access content.
* Supports multi-member access — shared vaults decryptable only by listed wallet addresses.

---

### 📦 2. Decentralized Storage via OG Storage

* Integrates the **OG Storage SDK** for verifiable, cost-efficient uploads.
* Files are stored on the **OG decentralized storage layer**, returning a **StorageHash** for proof and retrieval.
* All data remains encrypted end-to-end.

---

### 🧠 3. AI-Powered Intelligence via OG Inference

* Uses **OG Inference** for privacy-preserving, local-first intelligence.
* Automatically generates context-aware metadata and smart tags for each file.
* Enables **AI-assisted search, categorization, and summaries** without exposing file content.
* Supports:

  * **AI Auto-Vaulting** → Suggests themed vaults (“Legal Docs,” “NFT Assets,” etc.)
  * **Context-Aware Summaries** → Generates key points upon decryption (PDFs, videos, docs).

---

### 🗂 4. Vault & Access Management

* Each vault is tied to the user’s **OG wallet identity**.
* Users can grant access to others by adding their wallet addresses.
* Dashboard displays **Owned** and **Shared** vaults with transparent permission indicators.
* Files are grouped and tagged for easy navigation and retrieval.

---

### 💸 5. Payment and Access Controls

* Vaults can be funded with **OG tokens** for storage or AI usage fees.
* Files support **free**, **one-time fee**, or **subscription-based** access models.
* Built-in balance checks ensure uploads or AI tasks only execute when funded.

---

### 🛠 6. Metadata & Off-Chain Sync Layer

* Uses **Supabase** for off-chain metadata storage and quick querying.
* Maintains tables for fast sync between on-chain and app states:

  * `files → file_name, storage_hash, vault_id, owner_address, permissions, ai_tags, created_at`
  * `vaults → vault_id, owner, members, encrypted_key`
* Ensures responsive UI and smooth synchronization with OG network events.

---

## Problem

1. **Centralized storage still dominates** — users depend on providers who can access or censor their data.
2. **No privacy-safe AI systems** — most AI tools require sending raw data to centralized models.
3. **Limited data ownership** — no unified way to control access, payments, or storage permanence.

---

## Solution – EPSV on OG

**EPSV = Encrypted + Intelligent + Decentralized Vault System**

* **Fully encrypted storage** with OG Storage.
* **AI-enhanced management** via OG Inference.
* **OG wallet–based identity** for access and control.
* **Optional monetization** for paid sharing and AI compute.

---

## Architecture

```mermaid
flowchart TD
    A[User Device] -->|Encrypts File| B[EPSV Frontend]
    B --> C[OG Storage SDK]
    C --> D[OG Storage Network]
    B --> E[OG Inference]
    B --> F[Supabase Metadata Layer]
    F -->|Sync| B

    style A fill:#1d3557,stroke:#fff,color:#fff
    style D fill:#2a9d8f,stroke:#fff,color:#fff
    style E fill:#e76f51,stroke:#fff,color:#fff
```

---

## Data Encryption & Access Control

```mermaid
sequenceDiagram
    participant User
    participant EPSVApp
    participant KeyManager
    participant OGStorage

    User->>EPSVApp: Upload File
    EPSVApp->>KeyManager: Request AES-GCM Key
    KeyManager->>EPSVApp: Returns Encrypted Key
    EPSVApp->>EPSVApp: Encrypt File Locally
    EPSVApp->>OGStorage: Upload Encrypted Blob
    OGStorage->>EPSVApp: Return StorageHash
    EPSVApp->>User: Update Vault
```

---

## Benefits

1. **User-Owned Encryption** – Only the vault owner or added members can decrypt files.
2. **AI-Enhanced Experience** – OG Inference brings intelligent tagging and summaries.
3. **Decentralized Proofs** – Verifiable storage via OG Storage hashes.
4. **Monetizable Access** – Pay-per-access or subscription-based vaults.
5. **Developer Ready** – SDKs make integrating encrypted AI storage seamless.

---

