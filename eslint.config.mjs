import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: [
      "src/app/admin/**",
      "src/components/admin/**",
      "scripts/**",
      "src/lib/content/blog.ts",
      "src/app/api/**",
      "src/lib/**",
      "src/app/preview/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      // Disallow next/image fill combined with width/height props
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'JSXOpeningElement[name.name="Image"]:has(JSXAttribute[name.name="fill"]):has(JSXAttribute[name.name=/^(width|height)$/])',
          message: "next/image: Do not combine fill with width/height.",
        },
        {
          selector:
            'JSXOpeningElement[name.name="AspectImage"]:has(JSXAttribute[name.name="fill"]):has(JSXAttribute[name.name=/^(width|height)$/])',
          message: "AspectImage: Do not combine fill with width/height.",
        },
        {
          selector:
            'JSXOpeningElement[name.name="Image"]:has(JSXAttribute[name.name="fill"]):has(JSXAttribute[name.name="style"] ObjectExpression > Property[key.name=/^(width|height)$/])',
          message: "next/image: In fill mode, do not set style.width/height.",
        },
        {
          selector:
            'JSXOpeningElement[name.name="AspectImage"]:has(JSXAttribute[name.name="fill"]):has(JSXAttribute[name.name="style"] ObjectExpression > Property[key.name=/^(width|height)$/])',
          message: "AspectImage: In fill mode, do not set style.width/height.",
        },
        {
          selector:
            'JSXOpeningElement[name.name=/^(Image|img)$/] JSXAttribute[name.name="alt"][value.value=""]',
          message: "Images must not have empty alt text (unless purely decorative).",
        },
      ],
    },
  },
];

export default eslintConfig;
