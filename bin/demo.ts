import _ from "lodash";
import fsx from "fs-extra";
import path from "path";
import process from "node:process";
import * as tb from "trim-buffer";
import * as c from "commander";

import * as mmd from "../index.js";

type TextBlock = {
  initial: mmd.Token;
  parent?: TextBlock;
  start: number;
  end?: number;
};

type Part = TextBlock & { sections: TextBlock[] };

const print = (filename: string, buf: Buffer, block: TextBlock) => {
  const omissions = [] as mmd.Token[];
  const end = block.end ?? block.parent?.end;

  mmd.walk(block.initial, (token) => {
    if (end && token.start >= end) {
      return { stopWalking: true };
    }

    switch (token.type) {
      case mmd.Type.BLOCK_H1:
      case mmd.Type.BLOCK_H2:
      case mmd.Type.BLOCK_H3:
      case mmd.Type.BLOCK_H4:
      case mmd.Type.BLOCK_H5:
      case mmd.Type.BLOCK_H6:
      case mmd.Type.PAIR_BRACKET_ABBREVIATION:
      case mmd.Type.PAIR_BRACKET_CITATION:
      case mmd.Type.PAIR_BRACKET_FOOTNOTE:
      case mmd.Type.PAIR_BRACKET_GLOSSARY:
      case mmd.Type.PAIR_BRACKET_IMAGE:
      case mmd.Type.PAIR_BRACKET_VARIABLE:
        omissions.push(token);
        break;
    }
  });

  const file = fsx.openSync(filename, "w");
  let startPos = block.start;
  let hasTrimmedStart = false;

  omissions.forEach((token) => {
    const buffer = hasTrimmedStart
      ? buf.subarray(startPos, token.start)
      : tb.trimBufferStart(buf.subarray(startPos, token.start));

    fsx.writeSync(file, buffer);

    hasTrimmedStart =
      hasTrimmedStart || (startPos !== token.start && buffer.length > 0);
    startPos = token.start + token.len;
  });

  fsx.writeSync(
    file,
    hasTrimmedStart
      ? tb.trimBufferEnd(buf.subarray(startPos, end))
      : tb.trimBuffer(buf.subarray(startPos, end))
  );
  fsx.closeSync(file);
};

const collateParts = (rootToken: mmd.Token): Part[] => {
  let parts = [] as Part[];

  mmd.walk(rootToken, (token) => {
    switch (token.type) {
      case mmd.Type.BLOCK_H1: {
        const latestPart = parts.at(-1);

        if (latestPart) {
          latestPart.end = token.start;
        }

        parts.push({ initial: token, start: token.start, sections: [] });
        break;
      }
      case mmd.Type.BLOCK_H2: {
        const latestPart = parts.at(-1);
        const latestSection = latestPart?.sections.at(-1);

        if (latestSection) {
          latestSection.end = token.start;
        }

        parts.at(-1)?.sections.push({
          parent: latestPart,
          initial: token,
          start: token.start,
        });
        break;
      }
      case mmd.Type.BLOCK_DEF_FOOTNOTE:
        const latestPart = parts.at(-1);

        if (latestPart && !latestPart.end) {
          latestPart.end = token.start;
        }

        break;
    }
  });

  return parts;
};

c.program
  .name("mmd-js demo")
  .description("Parse a MultiMarkdown doc into parts & sections")
  .version("0.0.0")
  .argument("<file>", "File to parse")
  .action((file: string) => {
    const md = fsx.readFileSync(file);
    const parsed = mmd.parse(md);
    const parts = collateParts(parsed);

    parts.forEach((part, index) => {
      const partTitle = mmd.readTitle(md, part.initial);
      console.log(`CREATING PART: ${partTitle}`);
      const dirname = path.join(
        process.cwd(),
        "out",
        `PART ${index + 1} - ${partTitle}`
      );
      const numSections = part.sections.length;
      const padAmount = numSections.toString().length;

      fsx.mkdirpSync(dirname);

      part.sections.forEach((section, index) => {
        const sectionTitle = mmd.readTitle(md, section.initial);
        const filename = path.join(
          dirname,
          `SECTION ${_.padStart(
            (index + 1).toString(),
            padAmount,
            "0"
          )} - ${sectionTitle}.md`
        );

        console.log(`  - CREATING SECTION: ${sectionTitle}`);
        print(filename, md, section);
      });
    });
  });

c.program.parse();
