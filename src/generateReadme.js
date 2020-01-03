const fs = require('fs');

const toml = require('toml');
const groupBy = require('lodash/groupBy');
const sortBy = require('lodash/sortBy');
const compact = require('lodash/compact');
const find = require('lodash/find');
const { camelizeKeys } = require('humps');
const Handlebars = require('handlebars');
const moment = require('moment');
const glob = require('glob');

// From https://git.io/viRqj
const anchorify = text =>
  text
    .toLowerCase()
    .split(/ /)
    .join('-')
    .split(/\t/)
    .join('--')
    .split(/[|$&`~=\\\/@+*!?({[\]})<>=.,;:'"^]/)
    .join('');

const GITHUB_URL = 'https://github.com';

// Find duplicate entries in an array of objects for a given key.
const duplicatesForKey = (objectArray, key) =>
  objectArray
    .filter(
      (object, index) =>
        object[key] && find(objectArray.slice(index + 1), [key, object[key]])
    )
    .map(object => object[key]);

const generateReadme = () => {
  const readmeTemplate = Handlebars.compile(
    fs.readFileSync('./README.md.hbs').toString()
  );

  const metaContents = fs.readFileSync('./meta.toml');
  const meta = camelizeKeys(toml.parse(metaContents));
  const dataFiles = glob.sync('data/*.toml');
  const allCMSES = dataFiles.map(dataFile =>
    camelizeKeys(toml.parse(fs.readFileSync(dataFile)))
  );

  const duplicateURLS = duplicatesForKey(allCMSES, 'url');
  const duplicateGithubRepos = duplicatesForKey(allCMSES, 'githubRepo');

  if (duplicateURLS.length) {
    console.error(`Duplciate url found: ${duplicateURLS}`);
  }
  if (duplicateGithubRepos.length) {
    console.error(`Duplciate github_repo found: ${duplicateGithubRepos}`);
  }

  const { languagesToHuman } = meta;
  const cmsesByLanguage = groupBy(allCMSES, 'language');
  const languageKeys = Object.keys(cmsesByLanguage).sort();

  const tocEntries = languageKeys.map(key => {
    let humanName = languagesToHuman[key];
    if (!humanName) {
      console.error(
        `Human name missing for "${key}" language. Add it to meta.toml`
      );
      humanName = key;
    }
    return {
      text: humanName,
      anchor: anchorify(humanName),
    };
  });

  const cmsGroups = languageKeys.map(key => {
    const cmsesForLanguage = cmsesByLanguage[key];

    const cmsesWithDetails = cmsesForLanguage.map(
      ({ awesomeRepo, name, description, githubRepo, url }) => {
        const githubURL = githubRepo && `${GITHUB_URL}/${githubRepo}`;
        const awesomeURL = awesomeRepo && `${GITHUB_URL}/${awesomeRepo}`;

        if (githubRepo) {
          return {
            awesomeURL,
            name,
            githubURL,
            starImageURL: `https://flat.badgen.net/github/stars/${githubRepo}`,
            lastCommitURL: `https://flat.badgen.net/github/last-commit/${githubRepo}`,
            url,
            description,
          };
        }

        return {
          awesomeURL,
          name,
          url,
          description,
        };
      }
    );

    const sortedCMSES = sortBy(cmsesWithDetails, ({ name }) =>
      name.toLowerCase()
    );

    return {
      name: languagesToHuman[key],
      headerColumns: compact(['Name', 'Description']),
      cmses: sortedCMSES,
    };
  });

  fs.writeFileSync(
    'README.md',
    readmeTemplate({
      cmsCount: allCMSES.length,
      cmsGroups,
      generationTime: moment().format('MMMM Do, YYYY'),
      tocEntries,
    })
  );

  return allCMSES;
};

module.exports = generateReadme;
