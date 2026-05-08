"use client";
import * as React from "react";
import * as mmd from "mmd-js/wasm.js";
import * as dragdrop from "react-drag-drop-files";

type Data = { buf: ArrayBuffer; title: string; sections: Section[] };
type Section = { title: string; startIndex: number; endIndex: number };

const sampleDocument = `Title: MMD7 Demo Smoke

# First Section

This section was parsed by the MMD7 WASM AST.

# Second Section

The browser demo is using the local mmd-js package.

[^demo]: A deterministic footnote stops section collation.
`;

export default function Home() {
  const [data, setParsed] = React.useState<Data | null>(null);
  const [input, setInput] = React.useState(sampleDocument);
  const [error, setError] = React.useState<string | null>(null);
  const wasmLoadPromise = React.useRef<Promise<unknown> | null>(null);

  const parseBuffer = React.useCallback(async (buf: ArrayBuffer) => {
    setError(null);
    try {
      wasmLoadPromise.current ??= mmd.load("/mmd.wasm");
      await wasmLoadPromise.current;
      setParsed(collateSections(buf, mmd.parse(buf)));
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }, []);

  const handleDrop = async (file: File) => {
    await parseBuffer(await readFile(file));
  };

  const handleParseText = async () => {
    await parseBuffer(new TextEncoder().encode(input).buffer);
  };

  return (
    <div style={styles.page}>
      <aside style={styles.aside}>
        <dragdrop.FileUploader
          handleChange={handleDrop}
          label="Select a MultiMarkdown file"
        />
        <label style={styles.label} htmlFor="mmd-input">
          Or edit the sample fixture
        </label>
        <textarea
          id="mmd-input"
          aria-label="MultiMarkdown input"
          style={styles.textarea}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="button" onClick={() => void handleParseText()}>
          Parse sample
        </button>
        {error ? <p role="alert">{error}</p> : null}
      </aside>
      <main style={styles.main}>
        {!data ? (
          <p>Load data to see the sections</p>
        ) : (
          <>
            <p>MMD7 WASM loaded from /mmd.wasm</p>
            <h1>{data.title}</h1>
            <ul>
              {data.sections.map((section) => (
                <li key={`${section.title}:${section.startIndex}`}>
                  <details open>
                    <summary style={styles.summary}>{section.title}</summary>
                    <pre style={styles.pre}>{readSection(data.buf, section)}</pre>
                  </details>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

const readFile = async (file: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const buf = event.target?.result;

      if (buf instanceof ArrayBuffer) {
        resolve(buf);
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });

const collateSections = (buf: ArrayBuffer, root: mmd.Node): Data => {
  let title = "Untitled MultiMarkdown document";
  const sections: Section[] = [];

  mmd.walk(root, (node) => {
    switch (node.type) {
      case mmd.Type.LINE_META: {
        const [key, ...value] = mmd.read(buf, node).split(":");

        if (/title/i.test(key)) {
          title = value.join(":").trim();
        }
        break;
      }
      case mmd.Type.BLOCK_H1:
      case mmd.Type.BLOCK_H2:
      case mmd.Type.BLOCK_H3:
      case mmd.Type.BLOCK_H4:
      case mmd.Type.BLOCK_H5:
      case mmd.Type.BLOCK_H6:
      case mmd.Type.BLOCK_SETEXT_1:
      case mmd.Type.BLOCK_SETEXT_2: {
        const lastSection = sections.at(-1);

        if (lastSection) {
          lastSection.endIndex = node.start;
        }

        sections.push({
          title: readHeadingTitle(buf, node),
          startIndex: node.start + node.len,
          endIndex: -1,
        });
        break;
      }
      case mmd.Type.BLOCK_DEF_FOOTNOTE: {
        const lastSection = sections.at(-1);

        if (lastSection && lastSection.endIndex === -1) {
          lastSection.endIndex = node.start;
        }
        break;
      }
    }
  });

  for (const section of sections) {
    if (section.endIndex === -1) {
      section.endIndex = buf.byteLength;
    }
  }

  return { buf, title, sections };
};

const decoder = new TextDecoder();

const readHeadingTitle = (buf: ArrayBuffer, node: mmd.Node) => {
  const heading = mmd.readTitle(buf, node).trim();

  if (node.type === mmd.Type.BLOCK_SETEXT_1 || node.type === mmd.Type.BLOCK_SETEXT_2) {
    return heading.split(/\r?\n/)[0]?.trim() || "Untitled section";
  }

  return heading || "Untitled section";
};

const readSection = (buf: ArrayBuffer, section: Section) =>
  decoder.decode(buf.slice(section.startIndex, section.endIndex)).trim();

const styles = {
  page: {
    display: "flex",
    minHeight: "calc(100vh - 1rem)",
    gap: "1rem",
  },
  aside: {
    width: "22rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  label: { fontWeight: 600 },
  textarea: { minHeight: "20rem", fontFamily: "monospace" },
  main: { flex: 1, overflowY: "scroll", overflowX: "hidden" },
  pre: { wordWrap: "break-word", whiteSpace: "pre-wrap" },
  summary: { cursor: "pointer" },
} as const;
