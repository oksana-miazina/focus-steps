import fs from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

it("styles.css defines shared SSR primitives for SCR-01…04", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src", "ui", "styles.css"), "utf8");
  for (const className of [
    "app-shell",
    "primary-button",
    "text-link",
    "inline-message",
    "field-label",
    "field",
  ]) {
    expect(css.includes(`.${className}`), `missing .${className}`).toBe(true);
  }
});
