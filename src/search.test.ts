import MiniSearch from "minisearch";
import * as fs from "fs";

function testSearchIndex() {
    const rsshubEnDocs = fs.readFileSync('./search-index/RSSHub/en-US/search-index.json', 'utf8')

    const search = MiniSearch.loadJSON(rsshubEnDocs, {
        fields: ["title", "titles", "content"],
        storeFields: ["title", "titles"],
    });


    search.search("GitHub").forEach(result => {
        console.log(`Found document: ${result.title} (ID: ${result.id})`);
        console.dir(result, { depth: Infinity });
    });
}

testSearchIndex();