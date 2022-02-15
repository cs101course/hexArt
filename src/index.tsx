import * as React from "react";
import * as ReactDOM from "react-dom";

import {
  initLrs,
  saveAttachments,
  retrieveActivityState,
  saveActivityState,
} from "@openlearning/xapi";

import { App } from "./App";

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

const dataInUrl = JSON.parse(dataB64 ? b64UrlToAscii(dataB64) : "[]");

const dataAccessUrl = new URL(document.location.href);

const render = (
  onSave: (levelData: string[]) => Promise<void>,
  initialLevelData: string[]
) => {
  ReactDOM.render(
    <App onSave={onSave} initialLevelData={initialLevelData}/>,
    document.getElementById("root")
  );
};

const lrsSave = (data: string[]) => {
  dataAccessUrl.search = `?data=${asciiToB64Url(JSON.stringify(data))}`;

  // TODO multiple attachments on save

  // Save and Share
  return Promise.all([
    saveActivityState(lrsConfig, "data", {
      text: data
    }),
    saveAttachments(lrsConfig, [
      {
        contentType: "text/html",
        fileUrl: dataAccessUrl.toString(),
        description: "A chart created by the learner",
        display: "Chart",
      },
    ])
  ]).then(() => {});
};

const errorSave = (data: string[]) => {
  // If there's no LRS configured, just throw an error with the data URL
  dataAccessUrl.search = `?data=${asciiToB64Url(JSON.stringify(data))}`;
  return Promise.reject({
    error: "No LRS Configured",
    dataUrl: dataAccessUrl.toString(),
  });
};

if (dataInUrl) {
  // there's a data in the URL, render using this and no save
  render(null, dataInUrl);
} else if (lrsConfig) {
  // try load
  retrieveActivityState(lrsConfig, "data", null).then((data) => {
    const stateObject: any = data;
    const stateText: string = stateObject?.text || "";

    render(lrsSave, JSON.parse(stateText));
  });
} else {
  // testing purposes
  render(errorSave, []);
}
