"use client";
import * as React from "react";
import * as mmd from "mmd-js/wasm.js";
import * as dragdrop from "react-drag-drop-files";

type Data = { buf: ArrayBuffer; title: string; sections: Section[] };
type Section = { title: string; startIndex: number; endIndex: number };

export default function Home() {
  const [data, setParsed] = React.useState<Data | null>(null);
  const handleDrop = async (file: File) => {
    const buf = await readFile(file);
    setParsed(collateSections(buf, mmd.parse(buf)));
  };

  return (
    <div style={styles.page}>
      <dragdrop.FileUploader
        handleChange={handleDrop}
        label="Select a MultiMarkdown file"
      />
      <main style={styles.main}>
        {!data ? (
          <p>Load data to see the sections</p>
        ) : (
          <>
            <h1>{data.title}</h1>
            <ul>
              {data.sections.map((section) => (
                <li key={section.title}>
                  <details>
                    <summary>{section.title}</summary>
                    <pre style={styles.pre}>
                      {readSection(data.buf, section)}
                    </pre>
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

const readFile = async (file: File) => {
  await mmd.load();

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const buf = e.target?.result;

      if (buf instanceof ArrayBuffer) {
        resolve(buf);
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.readAsArrayBuffer(file);
  });
};

const collateSections = (buf: ArrayBuffer, root: mmd.Token | null) => {
  if (!root) {
    return null;
  }

  let title = "";
  let sections: Array<{
    title: string;
    startIndex: number;
    endIndex: number;
  }> = [];

  mmd.walk(root, (token) => {
    switch (token.type) {
      case mmd.Type.LINE_META: {
        const [key, value] = mmd.read(buf, token).split(":");

        if (/title/i.test(key)) {
          title = value.trim();
        }
        break;
      }
      case mmd.Type.BLOCK_H1: {
        const lastSection = sections.at(-1);

        if (lastSection) {
          lastSection.endIndex = token.start;
        }

        sections.push({
          title: mmd.readTitle(buf, token),
          startIndex: token.next!.start,
          endIndex: -1,
        });
        break;
      }
      case mmd.Type.BLOCK_DEF_FOOTNOTE: {
        const lastSection = sections.at(-1);

        if (lastSection) {
          lastSection.endIndex = token.start;
        }
        break;
      }
    }
  });

  return { buf, title, sections };
};

const decoder = new TextDecoder();
const readSection = (buf: ArrayBuffer, section: Section) =>
  decoder.decode(buf.slice(section.startIndex, section.endIndex)).trim();

const styles = {
  page: {
    display: "flex",
    minHeight: "calc(100vh - 1rem)",
    gap: "1rem",
  },
  main: { flex: 1, overflowY: "scroll", overflowX: "hidden" },
  pre: { wordWrap: "break-word", whiteSpace: "pre-wrap" },
} as const;
