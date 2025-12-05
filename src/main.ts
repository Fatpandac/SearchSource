import * as fs from "node:fs";
import { join } from "node:path";
import { globSync } from "fast-glob";
import source from "./source";
import { generateSearchIndex } from "./utils";

async function main() {
  Object.entries(source).forEach(([docsName, data]) => {
    const { repoPath, path } = data;
    const docsIndex = Object.entries(path).reduce(
      (prev, [locale, patterns]) => {
        const path = join(__dirname, "..", repoPath);
        const files = globSync(patterns, {
          cwd: path,
        });

        prev[locale] = {
          filePaths: files,
          rootPath: path,
        };

        return prev;
      },
      {} as Record<string, { filePaths: string[]; rootPath: string }>,
    );

    Object.entries(docsIndex).forEach(([locale, allFiles]) => {
      console.log(
        `Generating search index for ${docsName} - ${locale} with ${allFiles.filePaths.length} files.`,
      );
      const searchIndex = generateSearchIndex(allFiles.filePaths, allFiles.rootPath);
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
