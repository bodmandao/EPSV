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

export async function decryptFile(
  encryptedData: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
) {
  // Convert to regular ArrayBuffers efficiently
  const safeIv = new Uint8Array(iv.slice());
  const safeEncryptedData = new Uint8Array(encryptedData.slice());

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: safeIv },
    key,
    safeEncryptedData
  );

  return new Blob([decrypted]);
}
