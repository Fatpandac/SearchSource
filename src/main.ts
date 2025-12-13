import * as fs from "node:fs";
import { join } from "node:path";
import { globSync } from "fast-glob";
import source from "./source";
import { generateSearchIndex, getSubmoduleWorkingHash } from "./utils";

function writeVersionFile(packageName: string, locale: string, version: string) {
  const versionFilePath = join(__dirname, "..", "search-index", "versions.json");
  const versions: Record<string, Record<string, string>> = fs.existsSync(versionFilePath)
    ? JSON.parse(fs.readFileSync(versionFilePath, "utf-8"))
    : {};
    
  if (!versions[packageName]) {
    versions[packageName] = {};
  }

  versions[packageName][locale] = version;
  
  fs.writeFileSync(versionFilePath, JSON.stringify(versions, null, 2), "utf-8");
}

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
      writeVersionFile(
        docsName,
        locale,
        getSubmoduleWorkingHash(join(__dirname, "..", repoPath)),
      );
    });
  });
}

main();
