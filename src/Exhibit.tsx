import * as React from "react";
import { Editor } from "./Editor";
import { numLevels, levels } from "./levels";
import {
  cleanCode,
  hexToBinary,
  binaryToHex,
  hexFormat,
  render
} from "./image";

import "./App.css";

import frameUrl from "./frame.png";

const frameStyle = {
  backgroundImage: `url(${frameUrl})`,
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
};

interface ExhibitProps {
  level: number;
  text: string;
}

export const Exhibit = ({ level, text }: ExhibitProps) => {
  const artworkRef = React.useRef<HTMLCanvasElement>();
  const [error, setError] = React.useState("");
  const data = cleanCode(text);
  const currentLevelConfig = level === numLevels ? null : levels[level];
  const binaryString = currentLevelConfig
    ? currentLevelConfig.edit === "hexadecimal"
      ? hexToBinary(data)
      : data
    : "";
  const hexString = currentLevelConfig
    ? currentLevelConfig.edit === "hexadecimal"
      ? data
      : binaryToHex(data)
    : "";

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

  return (
    <div className="app">
      <h1>
        {level + 1}: {currentLevelConfig.title}
      </h1>

      <div className="artwork-space">
        <div style={frameStyle}>
          <canvas className="artwork" ref={artworkRef}></canvas>
        </div>
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

      <div className="viewer">
        <div className="editor">
          <Editor
            text={text}
          />
        </div>
      </div>
    </div>
  );
};
