import * as React from "react";
import { Editor } from "./Editor";

import "./App.css";

interface AppProps {
  onSave: (levelData: string[]) => Promise<void>;
  initialLevelData: string[];
}

const pixelWidth = 8;
const pixelHeight = 8;
const pixelSize = 32;

const highlight = (text: string) => {
  const lines = text
    .replace(/(<([^>]+)>)/gi, "")
    .split("\n")
    .map((line: string) => {
      const parts = line.split("//");
      if (parts.length > 1) {
        const code = parts.shift();
        return code + `<span class="code-comment">//${parts.join("//")}</span>`;
      } else {
        return line;
      }
    });

  return lines.join("\n");
};

const get1BitPixels = (binary: string) => {
  const pixels: number[][] = [];

  binary.split("").forEach((bit: string) => {
    pixels.push([Number(bit), Number(bit), Number(bit)]);
  });

  return pixels;
};

const getPixels = (binary: string, bits: number) => {
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

const cleanCode = (text: string) => {
  if (!text) return text;

  const lines = text.split("\n").map((line: string) => {
    return line.split("//")[0]; // remove comments
  });

  const commentsRemoved = lines.join("");
  return commentsRemoved.replace(/\s/g, "").toUpperCase();
};

const hexFormat = (hexString: string, bits: number): string => {
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

const hexToBinary = (hex: string) => {
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

const binaryToHex = (binary: string) => {
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

const render = (binary: string, canvas: HTMLCanvasElement, bits: number) => {
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

const levels: {
  [key: number]: {
    bits: number;
    edit: "binary" | "hexadecimal";
    title: string;
    instruction: string | React.ReactElement<any>;
  };
} = {
  0: {
    bits: 1,
    edit: "binary",
    title: "On and Off",
    instruction: (
      <span>
        Each pixel in the image is represented by a single bit. Use 1 to make a
        pixel white, and 0 to make a pixel black.
        <br />
        Draw a picture using 1's and 0's.
        <br />
        All white space (spaces and new lines) are ignored so you can format the
        text as you please.
      </span>
    ),
  },
  1: {
    bits: 3,
    edit: "binary",
    title: "Red, Green, and Blue",
    instruction: (
      <span>
        Each pixel in the image is now represented by three bits. The first bit
        represents red, the second green, and the third blue.
        <br />
        You can create new colours by mixing red, green, and blue.
        <br />
        e.g. 010 is just green (red off, green on, blue off), but 101 mixes red
        and blue to make magenta.
        <br />
        Draw a colourful picture using 1's and 0's.
      </span>
    ),
  },
  2: {
    bits: 6,
    edit: "binary",
    title: "More Colours",
    instruction: (
      <span>
        Each pixel in the image is now represented by six bits. Two for red, two
        for green, and two for blue.
        <br />
        You can now create even more colours by using four shades of each colour
        component: 00, 01, 10, and 11.
        <br />
        e.g. Bright green is 001100 (zero red, full green, zero blue), but dark
        green is 000100.
        <br />
        As each pixel is six bits, you can now choose from 64 different colours
        in total.
        <br />
        Draw another colourful picture using 1's and 0's.
      </span>
    ),
  },
  3: {
    bits: 12,
    edit: "binary",
    title: "Even More Colours",
    instruction: (
      <span>
        Each pixel in the image is now represented by twelve bits. Four for red,
        four for green, and four for blue.
        <br />
        e.g. Bright green is represented as 000011110000 (zero red, full green,
        zero blue).
        <br />
        As each pixel is twelve bits, you can now choose from 4096 different
        colours in total.
        <br />
        Draw an even more colourful picture using 1's and 0's.
        <p>
          A hexadecimal view is also shown so that you can see how binary can be
          abbreviated as hexadecimal.
          <br />
          e.g. 000011110000 is written in hexadecimal as 0F0. This makes it much
          easier to see the red, green, and blue values at a glance.
        </p>
      </span>
    ),
  },
  4: {
    bits: 24,
    edit: "hexadecimal",
    title: "Your Masterpiece",
    instruction: (
      <span>
        Each pixel in the image is now represented by twenty-four bits. Eight
        for red, eight for green, and eight for blue.
        <br />
        As each pixel is twenty-four bits, you can now choose from over 16
        million different colours.
        <br />
        Drawing a picture using binary will be very tedious, so this time you'll
        be using hexadecimal to draw your final masterpiece.
        <br/>
        Each pixel is 6 hexadecimal digits. e.g. Bright green is written as 00FF00 (zero red, full green, zero blue)
      </span>
    ),
  },
};

export const App = ({ onSave, initialLevelData }: AppProps) => {
  const artworkRef = React.useRef<HTMLCanvasElement>();

  const [level, setLevel] = React.useState(0);
  const [levelData, setLevelData] = React.useState(initialLevelData);
  const [error, setError] = React.useState("");

  const text = levelData[level] || "";
  const data = cleanCode(text);
  const currentLevelConfig = levels[level];
  const binaryString =
    currentLevelConfig.edit === "hexadecimal" ? hexToBinary(data) : data;
  const hexString =
    currentLevelConfig.edit === "hexadecimal" ? data : binaryToHex(data);

  const setText = (text: string) => {
    levelData[level] = text;
    setLevelData([...levelData]);
  };

  const nextLevel = () => {
    setLevel(level + 1);
  };

  const goBack = () => {
    setLevel(level - 1);
  };

  React.useEffect(() => {
    if (artworkRef?.current === undefined) return;

    let error = "";
    try {
      render(binaryString, artworkRef?.current, levels[level].bits);
    } catch (err) {
      error = err.message;
    }

    setError(error);
  }, [binaryString, level, artworkRef.current]);

  const placeholder = `Write ${currentLevelConfig.edit} here to build your artwork...`;

  return (
    <div className="app">
      <h1>
        {level + 1}: {currentLevelConfig.title}
      </h1>
      <div className="instruction">{currentLevelConfig.instruction}</div>
      <div className="viewer">
        <div className="editor">
          <Editor
            text={text}
            onChange={setText}
            highlight={highlight}
            placeholder={placeholder}
          />
        </div>
      </div>

      <div className="artwork-space">
        <canvas className="artwork" ref={artworkRef}></canvas>
        {currentLevelConfig.edit === "binary" && currentLevelConfig.bits >= 12 && (
          <div className="hexView">
            {hexFormat(hexString, currentLevelConfig.bits)
              .split("\n")
              .map((line) => (
                <div className="hexLine">
                  {line.split(" ").map((cell) => (
                    <span className="hexCell">{cell}</span>
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>
      <div className="artworkError">
        <pre>{error}</pre>
      </div>

      <div className="toolbar">
        {level > 0 && (
          <span onClick={goBack} className="goBack">
            &larr; Go back...
          </span>
        )}
        <span>
          {level < 4 ? (
            <span>
              When you're happy with your picture, click the "Next Challenge"
              button.
            </span>
          ) : (
            <span>
              When you're happy with your picture, click the "Finish" button.
            </span>
          )}
        </span>
        <button onClick={nextLevel} className="button" type="button">
          {level === 4 ? "Finish" : "Next Challenge"}
        </button>
      </div>
    </div>
  );
};
