import { randomUUID } from "node:crypto";
import { JSDOM } from "jsdom";
import MarkdownIt from "markdown-it";
import MiniSearch from "minisearch";

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
            const titles = current.titles
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
                current.text += `${next.textContent}\n`
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
    const miniSearch = new MiniSearch({
        fields: ["title", "titles", "content"],
        storeFields: ["title", "titles"],
    });

    for (const filePath of files) {
        const content = require("node:fs").readFileSync(filePath, "utf-8");
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


    const serializedIndex = JSON.stringify(miniSearch.toJSON());
    return serializedIndex;
}
