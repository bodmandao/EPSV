// Generate AES-GCM key
export async function generateVaultKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const raw = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw))); // base64 string
}

// Export to base64
export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

// Import from base64
export async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
}

// Encrypt file
export async function encryptFile(file: File, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await file.arrayBuffer());

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  const encryptedFile = new File(
    [encrypted],
    `${file.name}.enc`, // append .enc to mark encrypted file
    { type: "application/octet-stream", lastModified: Date.now() }
  );

  return {
    encryptedFile,
    iv: btoa(String.fromCharCode(...iv)), 
  };
}

// Decrypt file
export async function decryptFile(blob: Blob, key: CryptoKey, iv: number[]) {
  const data = new Uint8Array(await blob.arrayBuffer());
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    data
  );
  return new Blob([decrypted]);
}
