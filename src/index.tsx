import * as React from "react";
import * as ReactDOM from "react-dom";

import {
  initLrs,
  saveAttachments,
  retrieveActivityState,
  saveActivityState,
} from "@openlearning/xapi";

import { App } from "./App";
import { Exhibit } from "./Exhibit";

const lrsConfig = initLrs();

const asciiToB64Url = (ascii: string) => {
  return encodeURIComponent(window.btoa(ascii));
};

const b64UrlToAscii = (b64: string) => {
  return window.atob(decodeURIComponent(b64));
};

const urlParams = new URLSearchParams(window.location.search);

// query param ?data={b64 encoded json}
// to render a pre-made data, read-only
const dataB64 = urlParams.get("data");

const dataInUrl = JSON.parse(dataB64 ? b64UrlToAscii(dataB64) : "{}");

const renderExhibit = ({ level, text }: { level: number, text: string }) => {
  ReactDOM.render(
    <Exhibit level={level} text={text}/>,
    document.getElementById("root")
  );
}

const renderApp = (
  initialLevelData: string[]
) => {
  ReactDOM.render(
    <App onSave={lrsSave} initialLevelData={initialLevelData}/>,
    document.getElementById("root")
  );
};

const lrsSave = (data: string[]) => {
  const attachments = data.map((levelText, i) => {
    const dataAccessUrl = new URL(document.location.href);
    dataAccessUrl.search = `?data=${asciiToB64Url(JSON.stringify({
      level: i,
      text: levelText}
    ))}`;
    
    return {
      contentType: "text/html",
      fileUrl: dataAccessUrl.toString(),
      description: "An artwork created using binary or hexadecimal",
      display: `Artwork ${i+1}`,
    }
  });

  const state = {
    levels: data
  };

  if (lrsConfig) {
    // Save and Share
    return Promise.all([
      saveActivityState(lrsConfig, "data", state),
      saveAttachments(lrsConfig, attachments)
    ]).then(() => {});
  } else {
    console.log(attachments);
    console.log(state);
    return Promise.reject(new Error("No LRS Configured"));
  }
};

if (dataInUrl && dataInUrl.text) {
  // there's a data in the URL, render using this and no save
  renderExhibit(dataInUrl);
} else if (lrsConfig) {
  // try load
  retrieveActivityState(lrsConfig, "data", null).then((data) => {
    const stateObject: any = data;
    const stateText: string = stateObject?.text || "";

    renderApp(JSON.parse(stateText));
  });
} else {
  // testing purposes
  renderApp([]);
}
