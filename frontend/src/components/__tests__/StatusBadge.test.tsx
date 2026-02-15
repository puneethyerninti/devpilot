import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders reviewed label", () => {
    const html = renderToStaticMarkup(<StatusBadge status="reviewed" />);
    expect(html.toLowerCase()).toContain("reviewed");
  });

  it("renders posted label", () => {
    const html = renderToStaticMarkup(<StatusBadge status="posted" />);
    expect(html.toLowerCase()).toContain("posted");
  });
});
