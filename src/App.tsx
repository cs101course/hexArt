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

interface AppProps {
  onSave: (levelData: string[]) => Promise<void>;
  initialLevelData: string[];
}

export const App = ({ onSave, initialLevelData }: AppProps) => {
  const artworkRef = React.useRef<HTMLCanvasElement>();

  const [level, setLevel] = React.useState(initialLevelData.length);
  const [levelData, setLevelData] = React.useState(initialLevelData);
  const [error, setError] = React.useState("");

  const setText = (text: string) => {
    levelData[level] = text;
    setLevelData([...levelData]);
  };

  const nextLevel = () => {
    setLevel(level + 1);
    onSave(levelData);
  };

  const goBack = () => {
    setLevel(level - 1);
  };

  const text = levelData[level] || "";
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

  const placeholder = currentLevelConfig
    ? `Write ${currentLevelConfig.edit} here to build your artwork...`
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

  if (level === numLevels) {
    return (
      <div className="app">
        <div className="instruction">You have completed all the artworks.</div>
        <div className="toolbar">
          <span onClick={goBack} className="goBack">
            &larr; Go back...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>
        {level + 1}: {currentLevelConfig.title}
      </h1>
      <div className="instruction">{currentLevelConfig.instruction}</div>
      <div className="viewer">
        <div className="editor">
          <Editor text={text} onChange={setText} placeholder={placeholder} />
        </div>
      </div>

      <div className="artwork-space">
        <div style={frameStyle}>
          <canvas className="artwork" ref={artworkRef}></canvas>
        </div>
        {currentLevelConfig.edit === "binary" && currentLevelConfig.bits >= 12 && (
          <div className="hexView">
            {hexFormat(hexString, currentLevelConfig.bits)
              .split("\n")
              .map((line, i) => (
                <div className="hexLine" key={i}>
                  {line.split(" ").map((cell, j) => (
                    <span className="hexCell" key={`${i}-${j}`}>{cell}</span>
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
          {level < numLevels - 1 ? (
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
          {level === numLevels - 1 ? "Finish" : "Next Challenge"}
        </button>
      </div>
    </div>
  );
};
