#!/usr/bin/env bash
set -e

UPDATED_MODULES=()

echo "Fetching submodule remotes..."
git submodule foreach 'git fetch --quiet'

# 遍历每个 submodule
git submodule foreach '
    branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")
    ahead=$(git rev-list HEAD..origin/$branch --count 2>/dev/null || echo 0)

    if [ "$ahead" -gt 0 ]; then
        echo "[UPDATE] $name has $ahead new commits on origin/$branch"
        UPDATED_MODULES+=("$name")

        # 拉取最新提交
        git checkout $branch
        git merge origin/$branch --ff-only
    fi
'

if [ ${#UPDATED_MODULES[@]} -eq 0 ]; then
    echo "No submodule updates detected."
    echo "UPDATED=0" >> "$GITHUB_ENV"
    exit 0
fi

echo "Submodules updated:"
printf "%s\n" "${UPDATED_MODULES[@]}"

echo "UPDATED=1" >> "$GITHUB_ENV"
echo "UPDATED_LIST=${UPDATED_MODULES[*]}" >> "$GITHUB_ENV"