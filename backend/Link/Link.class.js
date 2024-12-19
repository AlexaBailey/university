import { readTxtFileAsJson } from "../utils/fileHandlers.js";

class LinkError extends Error {
  constructor(message) {
    super(message);
    this.name = "LinkError";
  }
}

class Link {
  constructor(link) {
    const match = link.match(/^\$\{([^/]+)\/(\d+)\/([^}]+)\}$/);
    if (!match) {
      throw new LinkError(`Invalid link format: ${link}`);
    }
    const [, tableName, rowNumber] = match;
    this.tableName = tableName;
    this.rowNumber = parseInt(rowNumber, 10);
  }

  async resolveRow() {
    const entities = await readTxtFileAsJson(`${this.tableName}.txt`);

    const rowIndex = this.rowNumber - 1;
    if (rowIndex < 0 || rowIndex >= entities.length) {
      throw new LinkError(
        `Row number ${this.rowNumber} is out of bounds for table ${this.tableName}`
      );
    }

    return entities[rowIndex];
  }

  static async findById(tableName, id) {
    const entities = await readTxtFileAsJson(`${tableName}`);
    const entity = entities.find((entry) => entry.id == id);
    console.log(id);
    if (!entity) {
      throw new LinkError(
        `Entity with id ${id} not found in table ${tableName}`
      );
    }

    return entity;
  }

  static async generateLinkForId(tableName, id) {
    const entities = await readTxtFileAsJson(`${tableName}`);
    const rowIndex = entities.findIndex((entry) => entry.id == id);

    if (rowIndex === -1) {
      throw new LinkError(
        `Entity with id ${id} not found in table ${tableName}`
      );
    }

    const rowNumber = rowIndex + 1;
    return `\${${tableName.replace(/\.txt$/, "")}/${rowNumber}/id}`;
  }
}

export default Link;
