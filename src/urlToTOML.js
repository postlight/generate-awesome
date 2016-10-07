const compact = require('lodash/compact');
const Xray = require('x-ray');
const promisify = require('es6-promisify');

const x = Xray();

function scrape(url) {
  let githubRepo;
  let githubOrg;
  if (/https:\/\/github.com/.test(url)) {
    const parts = url.split('/');
    githubOrg = parts[3];
    githubRepo = parts[4];
  }

  const scraperPromise = promisify(x(url, {
    title: 'title',
    description: 'meta[name="description"]@content',
    metaUrl: 'span[itemprop="url"]',
    languages: ['.lang'],
    // Fetch the title from the actual site, which will be more accurate.
    githubSite: x('span[itemprop="url"]@text', {
      title: 'title',
    }),
  }));

  return scraperPromise().then((data) => {
    const title = data.title;
    const metaUrl = data.metaUrl;
    let description = data.description;
    const firstLanguage = data.languages[0];

    // Handle special case where github duplicates the repo name in the
    // description.
    if (githubRepo) {
      description = description.split(' - ')[1];
    }

    const tomlArray = [
      `name = "${(data.githubSite.title || githubRepo || title || '').trim()}"`,
      `description = "${(description || title || '').trim()}"`,
      `url = "${metaUrl || url}"`,
      githubRepo && `github_repo = "${githubOrg}/${githubRepo}"`,
      firstLanguage && `language = "${firstLanguage.toLowerCase()}"`,
    ];

    return compact(tomlArray).join('\n');
  });
}

module.exports = scrape;
