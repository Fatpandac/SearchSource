import MiniSearch from "minisearch";
import MarkdownIt from "markdown-it";
import { JSDOM } from "jsdom";
import { randomUUID } from "crypto";

const md = new MarkdownIt();

function splitPageIntoSections(html: string) {
    const dom = new JSDOM(html)
    const document = dom.window.document

    const sections = []
    let current = {
        titles: [] as string[],
        text: '',
    }

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))

    headings.forEach((heading, idx) => {
        const level = Number(heading.tagName[1])
        const title = heading.textContent.trim() ?? ''

        if (idx !== 0 && current.text.trim()) {
            sections.push({ ...current })
            let titles = current.titles
            current = { titles, text: '' }
        }

        current.titles = current.titles.slice(0, level - 1)
        current.titles[level - 1] = title

        let next = heading.nextSibling
        while (
            next &&
            !(next instanceof dom.window.Element && /^H[1-6]$/.test(next.tagName))
        ) {
            if (next.textContent) {
                current.text += next.textContent + '\n'
            }
            next = next.nextSibling
        }
    })

    if (current.text.trim()) {
        sections.push(current)
    }

    return sections
}

export function generateSearchIndex(files: string[]) {
    let miniSearch = new MiniSearch({
        fields: ["title", "titles", "content"],
        storeFields: ["title", "titles"],
    });

    for (const filePath of files) {
        const content = require("fs").readFileSync(filePath, "utf-8");
        const mdContent = md.render(content);
        const sections = splitPageIntoSections(mdContent);

        sections.forEach(section => {
            miniSearch.add({
                id: randomUUID(),
                title: section.titles[0] || 'No Title',
                titles: section.titles,
                content: section.text,
            });
        });
    }


    let serializedIndex = JSON.stringify(miniSearch.toJSON());
    return serializedIndex;
}
