/**
 * Скрипт: generate-theme-presets.ts
 *
 * Този скрипт сканира директорията /styles/presets за CSS файлове, съдържащи дефиниции на теми.
 * Извлича `label:`, `value:` и дефиниции на основния цвят (`--primary`) за светъл и тъмен режим.
 * Тези основни цветове се използват за визуално представяне на всяка тема в UI (напр. цветни точки или преглед на темата).
 * Цветовете на темата по подразбиране се извличат от /app/globals.css.
 * Всички извлечени метаданни се инжектират в маркирана секция на файла /types/preferences/theme.ts.
 *
 * Употреба:
 * - По време на локална разработка, изпълнете ръчно след добавяне на нова тема:
 *     npm run generate:presets
 * - Уверете се, че всяка нова CSS тема включва коментари `label:` и `value:`.
 * - Тази генерация в момента е автоматизирана чрез Husky pre-push hook.
 * - По желание може да я интегрирате директно в build процеса.
 */
import fs from "fs";
import path from "path";

import prettier from "prettier";

const presetDir = path.resolve(__dirname, "../styles/presets");

if (!fs.existsSync(presetDir)) {
  console.error(`❌ Preset directory not found at: ${presetDir}`);
  process.exit(1);
}

const outputPath = path.resolve(__dirname, "../types/preferences/theme.ts");

const files = fs.readdirSync(presetDir).filter((file) => file.endsWith(".css"));

if (files.length === 0) {
  console.warn("⚠️ No preset CSS files found. Only default preset will be included.");
}

// eslint-disable-next-line complexity
const presets = files.map((file) => {
  const filePath = path.join(presetDir, file);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = fs.readFileSync(filePath, "utf8");

  const labelMatch = content.match(/label:\s*(.+)/);
  const valueMatch = content.match(/value:\s*(.+)/);

  if (!labelMatch) {
    console.warn(`⚠️ No 'label:' found in ${file}, using filename as fallback.`);
  }
  if (!valueMatch) {
    console.warn(`⚠️ No 'value:' found in ${file}, using filename as fallback.`);
  }

  const label = labelMatch?.[1]?.trim() ?? file.replace(".css", "");
  const value = valueMatch?.[1]?.trim() ?? file.replace(".css", "");

  // Извличане на основния цвят за светъл режим
  const lightPrimaryMatch = content.match(/:root\[data-theme-preset="[^"]*"\][\s\S]*?--primary:\s*([^;]+);/);
  // Извличане на основния цвят за тъмен режим
  const darkPrimaryMatch = content.match(/\.dark:root\[data-theme-preset="[^"]*"\][\s\S]*?--primary:\s*([^;]+);/);

  const primary = {
    light: lightPrimaryMatch?.[1]?.trim() ?? "",
    dark: darkPrimaryMatch?.[1]?.trim() ?? "",
  };

  if (!lightPrimaryMatch || !darkPrimaryMatch) {
    console.warn(`⚠️ Missing --primary for ${file} (light or dark). Check CSS syntax.`);
  }

  return { label, value, primary };
});

const globalStylesPath = path.resolve(__dirname, "../app/globals.css");

let globalContent = "";
try {
  globalContent = fs.readFileSync(globalStylesPath, "utf8");
} catch (err) {
  console.error(`❌ Could not read globals.css at ${globalStylesPath}`);
  console.error(err);
  process.exit(1);
}

// Regex за извличане на основния цвят по подразбиране за светъл режим
const defaultLightPrimaryRegex = /:root\s*{[^}]*--primary:\s*([^;]+);/;
// Regex за извличане на основния цвят по подразбиране за тъмен режим
const defaultDarkPrimaryRegex = /\.dark\s*{[^}]*--primary:\s*([^;]+);/;

const defaultLightPrimaryMatch = defaultLightPrimaryRegex.exec(globalContent);
const defaultDarkPrimaryMatch = defaultDarkPrimaryRegex.exec(globalContent);

const defaultPrimary = {
  light: defaultLightPrimaryMatch?.[1]?.trim() ?? "",
  dark: defaultDarkPrimaryMatch?.[1]?.trim() ?? "",
};

// Добавяне на темата по подразбиране в началото на масива
presets.unshift({ label: "Default", value: "default", primary: defaultPrimary });

// Генериране на TypeScript кода за инжектиране
const generatedBlock = `// --- generated:themePresets:start ---

export const THEME_PRESET_OPTIONS = ${JSON.stringify(presets, null, 2)} as const;

export const THEME_PRESET_VALUES = THEME_PRESET_OPTIONS.map((p) => p.value);

export type ThemePreset = (typeof THEME_PRESET_OPTIONS)[number]["value"];

// --- generated:themePresets:end ---`;

const fileContent = fs.readFileSync(outputPath, "utf8");

// Заместване на генерираната секция в целевия файл
const updated = fileContent.replace(
  /\/\/ --- generated:themePresets:start ---[\s\S]*?\/\/ --- generated:themePresets:end ---/,
  generatedBlock,
);

async function main() {
  // Форматиране на кода с Prettier
  const formatted = await prettier.format(updated, { parser: "typescript" });

  if (formatted === fileContent) {
    console.log("ℹ️  No changes in theme.ts");
    return;
  }

  fs.writeFileSync(outputPath, formatted);
  console.log("✅ theme.ts updated with new theme presets");
}

main().catch((err) => {
  console.error("❌ Unexpected error while generating theme presets:", err);
  process.exit(1);
});
