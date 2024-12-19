import fs from "fs/promises";
import { shannonFanoEncode, shannonFanoDecode } from "./shannonFano.js";
export async function decryptStoredKey(inputFile) {
  try {
    const encryptedKeyData = await fs.readFile(inputFile, "utf-8");

    const { compressedKey, codes } = JSON.parse(encryptedKeyData);

    const decryptedKey = shannonFanoDecode(compressedKey, codes);
    return decryptedKey;
  } catch (error) {
    console.error("Error decrypting the encryption key:", error.message);
    throw error;
  }
}

export async function encryptAndStoreKey(key, outputFile) {
  try {
    const { encoded: compressedKey, codes } = shannonFanoEncode(key);

    const encryptedKeyData = JSON.stringify({ compressedKey, codes });
    await fs.writeFile(outputFile, encryptedKeyData, "utf-8");
  } catch (error) {
    console.error("Error encrypting the encryption key:", error.message);
    throw error;
  }
}
