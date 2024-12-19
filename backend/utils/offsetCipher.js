export function offsetCipherEncrypt(data, keyWord) {
  const keyShifts = keyWord.split("").map((char) => char.charCodeAt(0));
  const keyLength = keyShifts.length;

  return data
    .split("")
    .map((char, index) => {
      const shift = keyShifts[index % keyLength] % 256;
      return String.fromCharCode((char.charCodeAt(0) + shift) % 256);
    })
    .join("");
}

export function offsetCipherDecrypt(data, keyWord) {
  const keyShifts = keyWord.split("").map((char) => char.charCodeAt(0));
  const keyLength = keyShifts.length;

  return data
    .split("")
    .map((char, index) => {
      const shift = keyShifts[index % keyLength] % 256;
      return String.fromCharCode((char.charCodeAt(0) - shift + 256) % 256);
    })
    .join("");
}
