const { sep, join, resolve } = require("path")
const fs = require('fs');
const core = require('@actions/core');
const exec = require('@actions/exec');

const wait = require('./wait')
const data = require('./package_.json') 

// most @actions toolkit packages have async methods
async function run() {

  readWritePackage();
  readWriteTestFile();

  try {
    let workingDirectory = core.getInput("working-directory", { required: false })
    let cwd = workingDirectory ? resolve(workingDirectory) : process.cwd()
    const CWD = cwd + sep
    const RESULTS_FILE = join(CWD, "jest.results.json")

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

    fs.writeFile("package.json", JSON.stringify(data), (err) => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });
}

function readWriteTestFile() {
  fs.readFile('marketplace_.spec.txt', (err, buf) => {
    if (err) console.error(err)
    fs.writeFile("marketplace.spec.js", buf, (err) => {
      if (err) console.log(err);
      console.log("Successfully Written tests to File.");
    });
  })
}

run();
