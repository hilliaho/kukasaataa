#!/usr/bin/env node

const fs = require("fs");

const file = process.argv[2] || "texts.json";

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function loadJSON(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf-8"));
  } catch (e) {
    fail(`JSON-virhe tiedostossa ${path}: ${e.message}`);
  }
}

function compareKeys(a, b, prefix = "") {
  for (const key of Object.keys(a)) {
    if (!(key in b)) {
      fail(`Puuttuva avain sv-puolelta: ${prefix}${key}`);
    }

    const valA = a[key];
    const valB = b[key];

    const typeA = Array.isArray(valA) ? "array" : typeof valA;
    const typeB = Array.isArray(valB) ? "array" : typeof valB;

    if (typeA !== typeB) {
      fail(
        `Tyyppivirhe avaimessa ${prefix}${key}: fi=${typeA}, sv=${typeB}`
      );
    }

    if (typeA === "object") {
      compareKeys(valA, valB, `${prefix}${key}.`);
    }

    if (typeA === "string" && valA.trim() === "") {
      fail(`Tyhjä merkkijono fi-puolella: ${prefix}${key}`);
    }

    if (typeA === "array") {
      if (valA.length !== valB.length) {
        fail(`Taulukon pituus ei täsmää avaimessa ${prefix}${key}`);
      }

      valA.forEach((item, i) => {
        if (typeof item !== "string") {
          fail(`Ei-merkkijono taulukossa fi: ${prefix}${key}[${i}]`);
        }
        if (item.trim() === "") {
          fail(`Tyhjä merkkijono taulukossa fi: ${prefix}${key}[${i}]`);
        }
      });
    }
  }
}

const data = loadJSON(file);

if (!data.fi || !data.sv) {
  fail("Juuresta puuttuu fi tai sv");
}

compareKeys(data.fi, data.sv);

console.log("scripts/validate-texts.js: OK");
