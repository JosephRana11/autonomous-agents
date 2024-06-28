#!/bin/bash

required_node_version="18.0.0"

# Remove the 'v' prefix from the version string
node_version=$(node -v | cut -c 2-)

version_lt() {
    [ "$(printf '%s\n' "$@" | sort -V | head -n 1)" = "$1" ]
}

# Compare the Node.js version with the required version
if version_lt "$node_version" "$required_node_version"; then
    echo "Installed Node.js version ($node_version) is less than required version ($required_node_version). Exiting."
    exit 1
else
    echo "Installed Node.js version ($node_version) meets the requirement."
fi

#Check if git is installed
if command -v git; then
    echo "Git is installed."
else
    echo "Git is not installed or not found in PATH."
    exit 1
fi

cd ~
mkdir cardano-autonomous-agent
git clone git@github.com:sireto/cardano-autonomous-agent.git
echo pwd
