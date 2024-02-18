import * as React from "react";
import * as ReactDOM from "react-dom";

import { SocketConnection } from "./lib/socket";

import * as styles from "../css/globals.module.scss";

type FormeInput = {
  label: string;
};

type FormeType =
  | {
      type: "input";
    }
  | ({
      type: "output";
    } & FormeOutput);

type FormeOutput = {
  format: "json" | "text";
};

const getFormeType = (input: string): FormeType => {
  const [prefix, _] = input.split(":");
  const payload = prefix.split("/").slice(1);

  if (payload[0] === "input") {
    return { type: "input" };
  } else if (payload[0] === "output") {
    return {
      type: "output",
      format: payload[1] as FormeOutput["format"],
    };
  }
};

const splitByColon = (input: string): [string, string] => {
  const index = input.indexOf(":");
  return [input.slice(0, index), input.slice(index + 1)];
};

const getFormeInputFromString = (input: string): FormeInput => {
  const [_, label] = splitByColon(input);
  return { label };
};

const getFormOutputFromString = (output: string): FormeOutput => {
  const [format, value] = splitByColon(output);
  if (format === "type/output/json") {
    return (
      <pre className={styles.output}>
        {JSON.stringify(JSON.parse(value), null, 2)}
      </pre>
    );
  }

  return <div className={styles.output}>value</div>;
};

function App() {
  const [socket] = React.useState<SocketConnection>(new SocketConnection());

  const [input, setInput] = React.useState<FormeInput | null>(null);
  const [output, setOutput] = React.useState<FormeOutput | null>(null);

  React.useEffect(() => {
    socket.onMessage((event) => {
      const formeType = getFormeType(event.data);
      if (formeType.type === "input") {
        const formInput = getFormeInputFromString(event.data);
        setInput(formInput);
        setOutput(null);
      } else if (formeType.type === "output") {
        setInput(null);
        setOutput(getFormOutputFromString(event.data));
      }
    });

    socket.onclose = function (event) {
      if (event.wasClean) {
        console.log(
          `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        // e.g., server process killed or network down
        // event.code is usually 1006 in this case
        console.warn("[close] Connection died");
      }
    };

    socket.onerror = function (error) {
      console.error(`[error] ${error.message}`);
    };
  }, []);

  return (
    <div id={styles.inputBox}>
      {input && (
        <label>
          <span>{input.label}</span>
          <input
            type="text"
            key={input.label}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                socket.send(e.target.value);
              }
            }}
            autoFocus
          />
        </label>
      )}
      {output}
    </div>
  );
}

// render root
ReactDOM.render(<App />, document.getElementById("root"));
