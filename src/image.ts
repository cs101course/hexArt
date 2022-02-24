export const pixelWidth = 8;
export const pixelHeight = 8;
export const pixelSize = 32;

export const get1BitPixels = (binary: string) => {
  const pixels: number[][] = [];

  binary.split("").forEach((bit: string) => {
    pixels.push([Number(bit), Number(bit), Number(bit)]);
  });

  return pixels;
};

export const getPixels = (binary: string, bits: number) => {
  let bitCount = 0;
  let channel = 0;
  let accumulator = 0;

  const channels: number[][] = [
    [], // red
    [], // green
    [], // blue
  ];

  binary.split("").forEach((bit: string) => {
    accumulator += Number(bit);

    bitCount++;
    if (bitCount === bits / 3) {
      channels[channel].push(accumulator);
      accumulator = 0;
      channel = (channel + 1) % 3;
      bitCount = 0;
    } else {
      accumulator <<= 1;
    }
  });

  return channels[0].map((red, i) => {
    return [red, channels[1][i] || 0, channels[2][i] || 0];
  });
};

export const cleanCode = (text: string) => {
  if (!text) return text;

  const lines = text.split("\n").map((line: string) => {
    return line.split("//")[0]; // remove comments
  });

  const commentsRemoved = lines.join("");
  return commentsRemoved.replace(/\s/g, "").toUpperCase();
};

export const hexFormat = (hexString: string, bits: number): string => {
  if (!hexString) return hexString;

  const length = (bits * 8) / 4;
  const lines = hexString.match(new RegExp(".{1," + length + "}", "g"));

  return lines
    .map((line) => {
      return line.match(new RegExp(".{1," + bits / 4 + "}", "g")).join(" ");
    })
    .join("\n")
    .toUpperCase();
};

export const hexToBinary = (hex: string) => {
  if (!hex) return hex;

  return hex
    .toUpperCase()
    .split("")
    .filter((char: string) => /^[0-9A-F]+$/.test(char))
    .map((hexDigit: string) => {
      return parseInt(hexDigit, 16).toString(2).padStart(4, "0");
    })
    .join("");
};

export const binaryToHex = (binary: string) => {
  if (!binary) return binary;

  const chunks = binary
    .split("")
    .filter((char: string) => /^[0-1]+$/.test(char))
    .join("")
    .match(/.{1,4}/g);

  if (!chunks) return binary;

  return chunks
    .map((binaryChunk: string) => {
      return parseInt(binaryChunk, 2).toString(16);
    })
    .join("");
};

export const render = (binary: string, canvas: HTMLCanvasElement, bits: number) => {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = pixelSize * pixelWidth;
  canvas.height = pixelSize * pixelHeight;

  const patternSize = 6;
  for (let y = 0; y < canvas.height; y += patternSize) {
    for (let x = 0; x < canvas.width; x += patternSize) {
      if ((x / patternSize) % 2 === (y / patternSize) % 2) {
        ctx.fillStyle = "#eeeeee";
      } else {
        ctx.fillStyle = "#ffffff";
      }
      ctx.fillRect(x, y, patternSize, patternSize);
    }
  }

  if (!binary) return;

  const pixels = bits === 1 ? get1BitPixels(binary) : getPixels(binary, bits);
  const maxVal = bits === 1 ? 1 : (1 << (bits / 3)) - 1;

  pixels
    .map((pixel) => {
      return [
        (pixel[0] * 255) / maxVal,
        (pixel[1] * 255) / maxVal,
        (pixel[2] * 255) / maxVal,
      ];
    })
    .forEach((pixel, i) => {
      const row = Math.floor(i / pixelWidth);
      const col = i % pixelWidth;

      ctx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
    });
};