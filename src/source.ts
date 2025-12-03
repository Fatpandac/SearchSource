type SourceInfo = {
  repoPath: string;
  path: Record<string, string | string[]>;
};

type Source = Record<"RSSHub" | "Rspress", SourceInfo>;

const source: Source = {
  RSSHub: {
    repoPath: "source/RSSHub-docs",
    path: {
      "zh-CN": "src/zh/**/*.md",
      "en-US": ["src/**/*.md", "!src/zh/**"],
    },
  },
  Rspress: {
    repoPath: "source/repress",
    path: {
      "zh-CN": "website/docs/zh/**/*.{md,mdx}",
      "en-US": "website/docs/en/**/*.{md,mdx}",
    }
  }
};

export default source;
