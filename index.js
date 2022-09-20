const { sep, join, resolve } = require("path")
const fs = require('fs');
const core = require('@actions/core');
const exec = require('@actions/exec');

const wait = require('./wait')
const data = require('./package_.json')

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
    await exec.exec('npm install -g jest',[], {CWD})
    await exec.exec('npm install -g jest-junit',[], {CWD})
    await exec.exec(`jest sample.spec.js --reporters="default" --reporters="jest-junit"`, {CWD})

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
  // fs.readFile("package_.json", "utf-8", (err, data) => {
  //   if (err) { console.log(err) }
  //   console.log(data);

    fs.writeFile("package.json", JSON.stringify(data), (err) => {
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
