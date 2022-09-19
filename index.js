const { sep, join, resolve } = require("path")
const fs = require('fs');
const core = require('@actions/core');
// const exec = require('@actions/exec');
const exec = require('@actions/exec');
const wait = require('./wait')

// most @actions toolkit packages have async methods
async function run() {

  try {
    let workingDirectory = core.getInput("working-directory", { required: false })
    let cwd = workingDirectory ? resolve(workingDirectory) : process.cwd()
    const CWD = cwd + sep
    const RESULTS_FILE = join(CWD, "jest.results.json")
    await exec.exec(`npm test --outputFile=${RESULTS_FILE}`, [], { silent: true, cwd })

    filenames = fs.readdirSync(CWD);

    const ms = core.getInput('milliseconds');
    core.info(`Waiting ${ms} milliseconds and Current Directory has these files ${filenames}`);
    // core.info(`working directory is ${workingDirectory} ...`);

    core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    await wait(parseInt(ms));
    core.info((new Date()).toTimeString());

    // await exec.exec('touch myfile.js')

    core.setOutput('time', new Date().toTimeString());
    core.setOutput('dir', CWD);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
