const fs = require("fs");
const util = require("util");

const rules = [];
const keywords = [];

const file = fs.readFileSync("rules.txt", "utf8");

const splitFile = file.split("Glossary\r\n");

const rulesText = splitFile[1];
const keywordsText = splitFile[2].split("Credits\r\n")[0];

function parseRules() {
  const splitRules = rulesText.split("\r\n");
  const mtgRules = [];

  let section = {};
  let subSections = [];
  let rules = [];

  let currentSubsection = {};

  for (let i = 3; i < splitRules.length; i++) {
    let currentRule = {};
    if (splitRules[i].length === 0) {
      continue;
    }

    const line = splitRules[i].split(/ (.*)/s);
    const key = line[0];
    const text = line[1];

    //If line denotes a rule within a sub-section
    if (key.length > 4) {
      if (key === "Example:") {
        rules[rules.length - 1].text += `\n${key}\n${text}`;
      } else {
        currentRule.key = key;
        currentRule.text = text;
      }

      rules.push(currentRule);
    }
    //If line denotes a sub-section
    if (key.length === 4) {
      if (rules.length !== 0) {
        currentSubsection.rules = rules;
        subSections.push(currentSubsection);
        currentSubsection = {};
        rules = [];
        currentRule = {};
      }
      currentSubsection = {
        key: key,
        text: text,
      };
    }

    //If line denotes a section
    if ((key.length < 4 && key.length > 0) || i === splitRules.length - 1) {
      if (subSections.length !== 0) {
        currentSubsection.rules = rules;
        subSections.push(currentSubsection);
        currentSubsection = {};
        rules = [];
        currentRule = {};
        section.subSections = subSections;
        mtgRules.push(section);
        section = {};
        subSections = [];
      }
      section.sectionKey = key;
      section.sectionText = text;
    }
  }

  return mtgRules;
}

function parseKeywords() {
  const splitKeywords = keywordsText.split("\r\n");
  const keywords = [];

  let newKeyword = true;
  let currentKeyword = { key: "", text: "" };

  for (let i = 1; i < splitKeywords.length; i++) {
    if (splitKeywords[i].length === 0) {
      keywords.push(currentKeyword);
      currentKeyword = { key: "", text: "" };
      newKeyword = true;
      continue;
    }
    if (newKeyword) {
      currentKeyword.key = splitKeywords[i];
      newKeyword = false;
    } else {
      currentKeyword.text += `${splitKeywords[i]}\n`;
    }
  }

  return keywords;
}

const mtgRules = parseRules();
const mtgKeywords = parseKeywords();

fs.writeFile("rules.json", JSON.stringify(mtgRules), "utf-8", (err) => {
  if (err) {
    console.log(err);
  }
});
fs.writeFile("keywords.json", JSON.stringify(mtgKeywords), "utf-8", (err) => {
  if (err) {
    console.log(err);
  }
});
