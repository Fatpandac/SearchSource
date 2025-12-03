import * as fs from "fs";
import { generateSearchIndex } from "./utils";
import source from "./source";
import { join } from "path";
import { globSync } from "fast-glob";

async function main() {
  Object.entries(source).forEach(([docsName, data]) => {
    const { repoPath, path } = data;
    const docsIndex = Object.entries(path).reduce(
      (prev, [locale, patterns]) => {
        const path = join(__dirname, "..", repoPath);
        const files = globSync(patterns, {
          cwd: path,
        });
        console.log(files, repoPath)

        prev[locale] = files.map((file) => join(path, file));

        return prev;
      },
      {} as Record<string, string[]>,
    );

    Object.entries(docsIndex).forEach(([locale, allFiles]) => {
      console.log(
        `Generating search index for ${docsName} - ${locale} with ${allFiles.length} files.`,
      );
      const searchIndex = generateSearchIndex(allFiles);
      const outputPath = join(
        __dirname,
        "..",
        "search-index",
        docsName,
        locale,
      );
      fs.mkdirSync(outputPath, { recursive: true });
      fs.writeFileSync(
        join(outputPath, "search-index.json"),
        searchIndex,
        "utf-8",
      );
    });
  });
}

main();
