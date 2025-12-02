#!/usr/bin/env bash
set -e

UPDATED_MODULES=()

echo "Fetching submodule remotes..."
git submodule update --init

# 遍历每个 submodule
UPDATED_MODULES=($(git submodule foreach --quiet '
    branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")
    git fetch origin "$branch" >/dev/null 2>&1
    ahead=$(git rev-list HEAD..origin/$branch --count 2>/dev/null || echo 0)
    if [ "$ahead" -gt 0 ]; then
        echo "$name"
        git checkout "$branch" >/dev/null 2>&1
        git merge origin/$branch --ff-only >/dev/null 2>&1
    fi
'))


if [ ${#UPDATED_MODULES[@]} -eq 0 ]; then
    echo "No submodule updates detected."
    echo "UPDATED=0" >> "$GITHUB_ENV"
    exit 0
fi

echo "Submodules updated:"
printf "%s\n" "${UPDATED_MODULES[@]}"

echo "UPDATED=1" >> "$GITHUB_ENV"
echo "UPDATED_LIST=${UPDATED_MODULES[*]}" >> "$GITHUB_ENV"
