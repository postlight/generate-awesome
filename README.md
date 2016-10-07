# Generate Awesome

A command-line tool for generating [Awesome Lists][] from a set of data files.

## Why?

Maintaining a Markdown-based Awesome List becomes difficult quickly. Merge
conflicts, typos, and duplicate entries are common. Generate Awesome uses a
discrete data file for each entry in the list. Generate Awesome also checks for
duplicates.

## Features

- Duplicate detection.
- GitHub metadata! Star count and last commit date.
- Human readable data files using [TOML][].

## Installation

Install Node 6 or higher. We recommend using [NVM][].

```
npm install -g generate-awesome
```

## Usage

**TODO update this once we have the final command set**

### Init

```
generate-awesome init
```

Creates a new project in the current folder.

### Add [url]


```
generate-awesome add [url]
```

Scrapes data from a given URL and creates a new TOML file in `/data`.

### Generate

```
generate-awesome generate
```

Generates the README.md file from README.md.hbs and the data in `/data`.

[NVM]: https://github.com/creationix/nvm
[TOML]: https://github.com/toml-lang/toml
[Awesome Lists]: https://github.com/sindresorhus/awesome
