import {
  readdirSync,
  readFileSync,
  lstatSync,
  rmSync,
  mkdirSync,
  existsSync,
} from "fs";
import { copySync } from "fs-extra";

const path_to_sorts = ["../Projets Actuel", "../Projets"];
const output_path = "../Projects";

function filter(src: string) {
  return src.includes("node_modules") ? false : true;
}

function outputName(path: string, i: number = 0): string {
  const add = i === 0 ? "" : ` (${i})`;

  if (existsSync(path + add)) {
    return outputName(path, i + 1);
  }

  return path + add;
}

function handleFolder(name: string, folder_path: string) {
  let output = outputName(
    `${output_path}/${name}/${folder_path.split("/").pop()}`
  );
  console.log(output);

  copySync(folder_path, output, {
    filter,
  });
}

function handleFiles(path: string, folder: string, files: string[]) {
  if (files.includes("package.json")) {
    const package_json = JSON.parse(
      readFileSync(`${path}/${folder}/package.json`, { encoding: "utf-8" })
    );
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

    let category: string = "Other";
    console.log(package_json);
    
    for (const type in types) {
      if (package_json?.dependencies?.hasOwnProperty(type) || package_json?.devDependencies?.hasOwnProperty(type)) {
        category = types[type];
        break;
      }
    }

    handleFolder("Javascript/" + category, `${path}/${folder}`);
    return;
  }

  if (
    files.some((file) => file.includes(".py")) ||
    files.includes("requirements.txt")
  ) {
    handleFolder("Python", `${path}/${folder}`);
    return;
  }

  if (files.some((file) => file.includes(".html"))) {
    handleFolder("HTML", `${path}/${folder}`);
    return;
  }

  if (
    files.every((file) => lstatSync(`${path}/${folder}/${file}`).isDirectory())
  ) {
    console.log("Recursive", files);

    handleFolderFiles(`${path}/${folder}`);
    return;
  }
  handleFolder("Other", `${path}/${folder}`);
}

function handleFolderFiles(path: string) {
  const dir = readdirSync(path);

  for (const folder of dir) {
    const path_string = `${path}/${folder}`;

    if (!lstatSync(path_string).isDirectory()) continue;

    const files = readdirSync(path_string);

    handleFiles(path, folder, files);
  }
}

// Create output folder
rmSync(output_path, { recursive: true, force: true });
mkdirSync(output_path);

for (const path_to_sort of path_to_sorts) {
  handleFolderFiles(path_to_sort);
}
