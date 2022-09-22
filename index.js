const core = require('@actions/core');
const exec = require('@actions/exec');
require('dotenv').config()

async function run() {
  try {
    process.chdir('json-tests')
    await exec.exec(`npm install`)
    await exec.exec(`npm test`)
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
