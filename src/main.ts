import MiniSearch from "minisearch";
import * as fs from "fs";
import { randomUUID } from "crypto";

type Docs = {
    id: string,
    title: string,
    content: string,
}

function generateSearchIndex(docs: Array<Docs>) {
    let miniSearch = new MiniSearch({
        fields: ["title", "content"],
        storeFields: ["id", "title"],
    });

    miniSearch.addAll(docs);

    let serializedIndex = JSON.stringify(miniSearch.toJSON());
    return serializedIndex;
}

function generateDocs(path: string) {
    const files = fs.readdirSync(path);

    let docs: Array<Docs> = files.reduce((prev, file) => {
        const isDirectory = fs.statSync(`${path}/${file}`).isDirectory();

        if (isDirectory) {
            const subDocs = generateDocs(`${path}/${file}`);
            return prev.concat(subDocs);
        } else {
            const content = fs.readFileSync(`${path}/${file}`, "utf-8");
            const titleMatch = content.match(/^#\s+(.*)/m);
            const title = titleMatch ? titleMatch[1] : "Untitled";

            return prev.concat([{
                id: randomUUID(),
                title: title,
                content: content,
            }]);
        }
    }, [] as Array<Docs>);

    return docs;
}

function main() {
    const docs = generateDocs("/Users/fatpandac/Repo/Blog/docs/zh");
    const index = generateSearchIndex(docs);
    fs.writeFileSync("search_index.json", index);
}

main();