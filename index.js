const { sep, join, resolve } = require("path")
const fs = require('fs');
const core = require('@actions/core');
const exec = require('@actions/exec');

const wait = require('./wait')
// const data = require('./package_.json')

const packageJson = {
  "name": "javascript-action",
  "version": "1.0.0",
  "description": "JavaScript Action Template",
  "main": "index.js",
  "scripts": {
    "lint": "eslint .",
    "test": "jest sample.spec.js --ci --reporters=default --reporters=jest-junit",
    // "prepare": "ncc build index.js -o dist --source-map --license licenses.txt",
    "all": "npm run lint && npm run prepare && npm run test"
  },
  "jest-junit": {
    "outputDirectory": "reports",
    "outputName": "jest-junit.xml",
    "ancestorSeparator": " › ",
    "uniqueOutputName": "false",
    "suiteNameTemplate": "{filepath}",
    "classNameTemplate": "{classname}",
    "titleTemplate": "{title}"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/actions/javascript-action.git"
  },
  "keywords": [
    "GitHub",
    "Actions",
    "JavaScript"
  ],
  "author": "",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/actions/javascript-action/issues"
  },
  "homepage": "https://github.com/actions/javascript-action#readme",
  "dependencies": {
    "@actions/core": "^1.2.5",
    "@actions/exec": "^1.1.1",
  },
  "devDependencies": {
    "@vercel/ncc": "^0.31.1",
    "eslint": "^8.0.0",
    "jest": "^27.2.5",
    "jest-junit": "^14.0.1"
  }
}

const testString = `
describe('my sample test', ()=> {
  test('one is one', ()=> {
      expect(1).toBe(1)
  })
  test('another', ()=> {
      expect(1).toBe(1)
  })
})
`

// most @actions toolkit packages have async methods
async function run() {

  readWritePackage();
  readWriteTestFile();

  try {
    let workingDirectory = core.getInput("working-directory", { required: false })
    let cwd = workingDirectory ? resolve(workingDirectory) : process.cwd()
    const CWD = cwd + sep
    const RESULTS_FILE = join(CWD, "jest.results.json")

    // await exec.exec(`npm test --testLocationInResults --json --outputFile=${RESULTS_FILE} --coverage --reporters="default" --reporters="jest-junit"`, [])
    // await exec.exec('npm install -g jest',[], {CWD})
    // await exec.exec('npm install -g jest-junit',[], {CWD})
    // await exec.exec(`jest sample.spec.js --ci --reporters="default" --reporters="jest-junit"`,[], {CWD})
    await exec.exec(`npm install`,[], {CWD})
    await exec.exec(`npm test`,[], {CWD})

    filenames = fs.readdirSync(CWD);

    const ms = core.getInput('milliseconds');
    core.info(`Waiting ${ms} milliseconds and Current Directory has these files ${filenames}`);

    core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    await wait(parseInt(ms));
    core.info((new Date()).toTimeString());


    core.setOutput('time', new Date().toTimeString());
    core.setOutput('dir', CWD);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function readWritePackage() {

    fs.writeFile("package.json", JSON.stringify(packageJson), (err) => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });
// })
}

function readWriteTestFile() {

    fs.writeFile("sample.spec.js", testString, (err) => {
      if (err) console.log(err);
      console.log("Successfully Written tests to File.");
    });
}

run();
