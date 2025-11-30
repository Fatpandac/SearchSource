import * as fs from "fs";
import { generateDocs, generateSearchIndex } from "./utils.js";

function main() {
    const docs = generateDocs("");
    const index = generateSearchIndex(docs);
    fs.writeFileSync("search_index.json", index);
}

main();