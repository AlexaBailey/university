function getFrequencies(data) {
  const frequencies = {};
  for (const char of data) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  return Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
}

function buildShannonFanoTree(frequencies) {
  const generateCodes = (symbols, prefix = "") => {
    if (symbols.length === 1) {
      return { [symbols[0][0]]: prefix };
    }

    const totalWeight = symbols.reduce((sum, [, weight]) => sum + weight, 0);
    let splitIndex = 0;
    let weightSum = 0;

    for (let i = 0; i < symbols.length; i++) {
      if (weightSum >= totalWeight / 2) break;
      weightSum += symbols[i][1];
      splitIndex = i + 1;
    }

    const left = symbols.slice(0, splitIndex);
    const right = symbols.slice(splitIndex);

    return {
      ...generateCodes(left, prefix + "0"),
      ...generateCodes(right, prefix + "1"),
    };
  };

  return generateCodes(frequencies);
}

export function shannonFanoEncode(data) {
  const frequencies = getFrequencies(data);
  const codes = buildShannonFanoTree(frequencies);
  const encoded = data
    .split("")
    .map((char) => codes[char])
    .join("");
  return { encoded, codes };
}

export function shannonFanoDecode(encoded, codes) {
  const reverseCodes = Object.fromEntries(
    Object.entries(codes).map(([char, code]) => [code, char])
  );

  let currentCode = "";
  let decoded = "";

  for (const bit of encoded) {
    currentCode += bit;
    if (currentCode in reverseCodes) {
      decoded += reverseCodes[currentCode];
      currentCode = "";
    }
  }

  return decoded;
}
