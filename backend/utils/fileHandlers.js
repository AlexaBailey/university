import fs from "fs/promises";
import { decryptFileAndValidate } from "./crypt.js";
import { decryptStoredKey } from "./key_encryption.js";

export const convertJsonToTxt = async (jsonFilename, txtFilename) => {
  try {
    const data = await fs.readFile(`./data/${jsonFilename}`, "utf-8");
    const jsonData = JSON.parse(data);

    if (!Array.isArray(jsonData)) {
      throw new Error(`${jsonFilename} does not contain an array`);
    }

    const keys = Object.keys(jsonData[0])
      .map((key) => (key === "days" ? "days (comma-separated)" : key))
      .join(",");
    const rows = jsonData
      .map((item) =>
        Object.entries(item)
          .map(([key, value]) =>
            Array.isArray(value) ? value.join("|") : value
          )
          .join(",")
      )
      .join("\n");
    const txtData = `${keys}\n${rows}`;

    await fs.writeFile(`./data/${txtFilename}`, txtData, "utf-8");
  } catch (error) {
    console.error(`Error converting ${jsonFilename} to ${txtFilename}:`, error);
  }
};
export const readTxtFileAsJson = async (data) => {
  try {
    const lines = data.trim().split("\n");
    const headers = lines[0]
      .split(",")
      .map((header) => header.trim().replace(/\r$/, ""));

    return lines.slice(1).map((line) => {
      const values = line
        .split(",")
        .map((value) => value.trim().replace(/\r$/, ""));
      const obj = {};

      headers.forEach((key, index) => {
        obj[key] =
          key === "schedule" && values[index]?.includes("|")
            ? values[index]
                .split("|")
                .map((val) => val.trim().replace(/\r$/, ""))
            : values[index];
      });

      return obj;
    });
  } catch (error) {
    console.error("Error reading text file as JSON:", error);
    return [];
  }
};

export const saveJsonToTxtFile = async (filename, data) => {
  try {
    const keys = Object.keys(data[0]).map((key) =>
      key.replace(/\r/g, "").trim()
    );
    const rows = data
      .map((item) =>
        keys
          .map((key) =>
            key === "schedule" && Array.isArray(item[key])
              ? item[key].map((v) => v.replace(/\r/g, "").trim()).join("|")
              : item[key]?.toString().replace(/\r/g, "").trim()
          )
          .join(",")
      )
      .join("\n");

    const txtData = `${keys.join(",")}\n${rows}`;
    await fs.writeFile(`./data/${filename}`, txtData, "utf-8");
  } catch (error) {
    console.error(`Error saving to ${filename}:`, error);
    throw new Error(`Could not save data to file: ${filename}`);
  }
};

export const saveArrayDataToTxtFile = async (filename, data, formatRow) => {
  try {
    if (!data || !data.length) {
      throw new Error("Data is empty or not provided");
    }

    const header = Object.keys(data[0]).join(",");

    const rows = data.map(formatRow).join("\n");

    const txtData = `${header}\n${rows}`;

    await fs.writeFile(`./data/${filename}`, txtData, "utf-8");
  } catch (error) {
    console.error(`Error saving array data to ${filename}:`, error);
    throw new Error(`Could not save array data to file: ${filename}`);
  }
};

export async function readDecryptedFile(file) {
  const decryptedKey = await decryptStoredKey("./data/encrypted_key.json");
  const decryptedData = await decryptFileAndValidate(file, decryptedKey);
  const data = await readTxtFileAsJson(decryptedData);
  return data;
}
