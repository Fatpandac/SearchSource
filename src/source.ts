const source = {
    RSSHub: {
        repoPath: "source/RSSHub-docs",
        path: {
            "zh-CN": "src/zh/**/*.md",
            "en-US": [
                "src/**/*.md",
                "!src/zh/**"
            ]
        } as Record<string, string | string[]>
    }
} as const;


export default source;