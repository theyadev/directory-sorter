import {
  readdirSync,
  readFileSync,
  lstatSync,
  rmSync,
  mkdirSync,
  existsSync,
} from "fs";
import { copySync } from "fs-extra";


const types: { [key: string]: string } = {
  nuxt: "NuxtJS",
  next: "NextJS",
  react: "React",
  vue: "Vue",
  "@angular/core": "Angular",
  svelte: "Svelte",
  express: "Express",
  "discord.js": "Bot Discord",
  puppeteer: "Scrapping",
};

let total = 0;
let current = 0;

function filter(src: string) {
  return src.includes("node_modules") ? false : true;
}
/**
 * Use to get the name of the directory.
 * If the directory already exist, it will add a number at the end of the name.
 * @param path The path to the directory.
 * @returns The path to the directory.
 */
function getDirectoryName(path: string, i: number = 0): string {
  const add = i === 0 ? "" : ` (${i})`;

  if (existsSync(path + add)) {
    return getDirectoryName(path, i + 1);
  }

  return path + add;
}

/**
 * Copy a directory to another directory, can have a parent directory.
 * @param parent_name The name of the parent directory.
 * @param dir_path The path to the directory to copy.
 * @param dir_out_path The path to the output directory.
 */
function copyDirectory(
  parent_name: string,
  dir_path: string,
  dir_out_path: string
) {
  let output = getDirectoryName(
    `${dir_out_path}/${parent_name}/${dir_path.split("/").pop()}`
  );

  copySync(dir_path, output, {
    filter,
  });
}

function handleFiles(path: string, folder: string, files: string[], output_path: string) {
  // Vanilla HTML Projects
  if (files.some((file) => file.includes(".html"))) {
    copyDirectory("HTML", `${path}/${folder}`, output_path);
    return;
  }
  // JS Projects
  if (files.includes("package.json")) {
    const package_json = JSON.parse(
      readFileSync(`${path}/${folder}/package.json`, { encoding: "utf-8" })
    );

    let category: string = "Other";

    if (package_json.workspaces) {
      category = "Monorepo";
    } else {
      for (const type in types) {
        if (
          package_json?.dependencies?.hasOwnProperty(type) ||
          package_json?.devDependencies?.hasOwnProperty(type)
        ) {
          category = types[type];
          break;
        }
      }
    }

    copyDirectory("Javascript/" + category, `${path}/${folder}`, output_path);
    return;
  }

  // Python Projects
  if (
    files.some((file) => file.includes(".py")) ||
    files.includes("requirements.txt")
  ) {
    copyDirectory("Python", `${path}/${folder}`, output_path);
    return;
  }

  // Subfolder Projects
  if (
    files.every((file) => lstatSync(`${path}/${folder}/${file}`).isDirectory())
  ) {
    handleFolderFiles(`${path}/${folder}`, output_path);
    return;
  }
  copyDirectory("Other", `${path}/${folder}`, output_path);
}

export function handleFolderFiles(path: string, output_path: string) {
  const dir = readdirSync(path);

  total += dir.length;

  for (const folder of dir) {
    const path_string = `${path}/${folder}`;

    if (!lstatSync(path_string).isDirectory()) continue;

    const files = readdirSync(path_string);

    handleFiles(path, folder, files, output_path);

    current++;
    console.log(`${current}/${total}: ${folder}`);
  }
}

// // Create output folder
// rmSync(OUTPUT_PATH, { recursive: true, force: true });
// mkdirSync(OUTPUT_PATH);

// for (const path_to_sort of path_to_sorts) {
//   handleFolderFiles(path_to_sort);
// }
