/*
  Codemod: Fix next/image fill misuse and add sizes
  - Removes width/height props when fill is present
  - Removes style.width/style.height when fill is present
  - Ensures className includes "object-cover"
  - Adds sizes="100vw" when fill is present and sizes missing

  Run: pnpm tsx scripts/codemods/fix-image-fill.ts
*/
import { Project, SyntaxKind, JsxAttribute, Node, PropertyAssignment } from "ts-morph";
import path from "node:path";
import fs from "node:fs";

const root = process.cwd();
const project = new Project({
  tsConfigFilePath: fs.existsSync(path.join(root, "tsconfig.json"))
    ? path.join(root, "tsconfig.json")
    : undefined,
  skipAddingFilesFromTsConfig: true,
});

const files = [
  ...walk("src", (p) => p.endsWith(".tsx")),
];
files.forEach((f) => project.addSourceFileAtPathIfExists(f));

let changedFiles = 0;

for (const sf of project.getSourceFiles()) {
  let changed = false;
  const jsxElements = [
    ...sf.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
    ...sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
  ];

  jsxElements.forEach((el) => {
    const name = el.getTagNameNode().getText();
    if (name !== "Image" && name !== "AspectImage") return;

    const attrs = el.getAttributes().filter((a): a is JsxAttribute => a.getKind() === SyntaxKind.JsxAttribute);
    const getAttrName = (a: JsxAttribute) => a.getNameNode().getText();
    const hasFill = attrs.some((a) => getAttrName(a) === "fill");
    if (!hasFill) return;

    // Drop width/height props
    ["width", "height"].forEach((key) => {
      const a = attrs.find((x) => getAttrName(x) === key);
      if (a) {
        a.remove();
        changed = true;
      }
    });

    // Clean style.width/style.height
    const styleAttr = attrs.find((a) => getAttrName(a) === "style");
    if (styleAttr) {
      const init = styleAttr.getInitializer();
      if (init && Node.isJsxExpression(init)) {
        const expr = init.getExpression();
        if (expr && Node.isObjectLiteralExpression(expr)) {
          expr.getProperties().forEach((p) => {
            if (Node.isPropertyAssignment(p)) {
              const key = (p as PropertyAssignment).getNameNode().getText().replace(/['"`]/g, "");
              if (key === "width" || key === "height") {
                p.remove();
                changed = true;
              }
            }
          });
        }
      }
    }

    // Ensure className includes object-cover
    const classAttr = attrs.find((a) => getAttrName(a) === "className");
    if (!classAttr) {
      el.addAttribute({ name: "className", initializer: '"object-cover"' });
      changed = true;
    } else {
      const init = classAttr.getInitializer();
      if (init && Node.isStringLiteral(init)) {
        const val = init.getLiteralText();
        if (!val.split(/\s+/).includes("object-cover")) {
          init.setLiteralValue(val ? `${val} object-cover` : "object-cover");
          changed = true;
        }
      }
    }

    // Ensure sizes present
    const sizesAttr = attrs.find((a) => getAttrName(a) === "sizes");
    if (!sizesAttr) {
      el.addAttribute({ name: "sizes", initializer: '"100vw"' });
      changed = true;
    }
  });

  if (changed) {
    changedFiles++;
  }
}

if (changedFiles > 0) {
  project.saveSync();
}

console.log(`fix-image-fill: processed ${files.length} files; updated ${changedFiles}.`);

function walk(dir: string, filter: (p: string) => boolean, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, filter, acc);
    else if (filter(full)) acc.push(full);
  }
  return acc;
}
