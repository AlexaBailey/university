import fs from "fs/promises";
import { offsetCipherEncrypt, offsetCipherDecrypt } from "./offsetCipher.js";
import { shannonFanoEncode, shannonFanoDecode } from "./shannonFano.js";
import { decryptStoredKey } from "./key_encryption.js";

export const encryptFile = async (filename, keyWord) => {
  try {
    const plainData = await fs.readFile(`./data/${filename}`, "utf-8");
    const { encoded: compressedData, codes } = shannonFanoEncode(plainData);
    const encryptedData = offsetCipherEncrypt(
      JSON.stringify({ compressedData, codes }),
      keyWord
    );

    await fs.writeFile(`./data/${filename}`, encryptedData, "utf-8");
  } catch (error) {
    console.error(`Error encrypting file ${filename}:`, error.message);
  }
};

export const saveAndEncryptData = async (filename, data) => {
  try {
    const plainData = convertJsonToTxt(data);

    const { encoded: compressedData, codes } = shannonFanoEncode(plainData);
    const decryptedKey = await decryptStoredKey("./data/encrypted_key.json");

    const encryptedData = offsetCipherEncrypt(
      JSON.stringify({ compressedData, codes }),
      decryptedKey
    );
    await fs.writeFile(`./data/${filename}`, encryptedData, "utf-8");
  } catch (error) {
    console.error(`Error encrypting file ${filename}:`, error.message);
  }
};

export const convertJsonToTxt = (data) => {
  const keys = Object.keys(data[0]);
  const rows = data
    .map((item) =>
      keys
        .map((key) =>
          key === "schedule" && Array.isArray(item[key])
            ? item[key].join("|")
            : item[key]
        )
        .join(",")
    )
    .join("\n");

  const plainData = `${keys.join(",")}\n${rows}`;
  return plainData;
};

export async function readEncryptedData(filename, keyWord) {
  try {
    const encryptedData = await fs.readFile(filename, "utf-8");

    const decryptedJson = offsetCipherDecrypt(encryptedData, keyWord);

    const { compressedData, codes } = JSON.parse(decryptedJson);
    const decompressedData = shannonFanoDecode(compressedData, codes);

    return JSON.parse(decompressedData);
  } catch (error) {
    console.error("Error reading encrypted data:", error.message);
    throw error;
  }
}

export const decryptFileAndValidate = async (filename, keyWord) => {
  try {
    const encryptedData = await fs.readFile(`./data/${filename}`, "utf-8");
    const decryptedJson = offsetCipherDecrypt(encryptedData, keyWord);
    let parsedData;
    try {
      parsedData = JSON.parse(decryptedJson);
    } catch (error) {
      console.error("JSON Parse Error:", error.message);
      throw new Error("Decrypted data is not valid JSON.");
    }
    const { compressedData, codes } = parsedData;
    const plainData = shannonFanoDecode(compressedData, codes);

    // console.log(`File decrypted successfully: ${filename}`);
    return plainData;
  } catch (error) {
    console.error(`Error decrypting file ${filename}:`, error.message);
    throw error;
  }
};
