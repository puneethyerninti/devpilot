import { parsePatch, chunkHunks } from "../jobProcessor";

describe("diff chunker", () => {
  const samplePatch = `@@ -1,3 +1,4 @@\n-line1\n+line1 changed\n line2\n+line3\n`;

  it("parses hunks with start/end lines", () => {
    const hunks = parsePatch("src/file.ts", samplePatch);
    expect(hunks.length).toBe(1);
    expect(hunks[0].startLine).toBe(1);
    expect(hunks[0].endLine).toBe(4);
    expect(hunks[0].file).toBe("src/file.ts");
  });

  it("chunks hunks into size-limited pieces", () => {
    const hunks = parsePatch("src/file.ts", samplePatch);
    const chunks = chunkHunks(hunks, 50);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].file).toBe("src/file.ts");
    expect(chunks[0].hunk.length).toBeGreaterThan(0);
  });
});
