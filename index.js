const { sep, resolve} = require("path")
const fs = require('fs');
const core = require('@actions/core');
const exec = require('@actions/exec');
const package = require('./package_.json')
const testCode = require('./marketplace_tests.js').getTests()

async function run() {
  readWritePackage();
  readWriteTestFile();
  try {
    let workingDirectory = core.getInput("working-directory", { required: false })
    let cwd = workingDirectory ? resolve(workingDirectory) : process.cwd()
    const CWD = cwd + sep
    await exec.exec(`npm install`,[], {CWD})
    await exec.exec(`npm test`,[], {CWD})
  } catch (error) {
    core.setFailed(error.message);
  }
}

function readWritePackage() {
  package.scripts.prepare = 'ncc build index.js -o dist --source-map --license licenses.txt'
  fs.writeFile("package.json", JSON.stringify(package), (err) => {
    if (err) console.log(err);
  });
}

function readWriteTestFile() {
  fs.writeFile("marketplace.spec.js", testCode, (err) => {
    if (err) console.log(err);
  });
}

run();
