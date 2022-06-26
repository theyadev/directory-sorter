#!/usr/bin/env node
import { program } from "commander";
import { existsSync, mkdirSync } from "fs";
import { handleFolderFiles } from "../";

program
  .option("-p, --path <path...>", "path to sort")
  .option("-o, --output <path...>", "output path");

program.parse();

const options = program.opts();

const path = options.path.join(" ");
const output = options.output.join(" ");

if (!existsSync(path)) {
  console.log("Path does not exist");
  process.exit(1);
}

handleFolderFiles(path, output);
