const { sep, join, resolve, path } = require("path")
const fs = require('fs');
const core = require('@actions/core');
const exec = require('@actions/exec');

const wait = require('./wait')
const package = require('./package_.json') 
// const tests = require('./marketplace_.spec.txt')

// const package_ = {
//   "name": "javascript-action",
//   "version": "1.0.0",
//   "description": "JavaScript Action Template",
//   "main": "index.js",
//   "scripts": {
//     "lint": "eslint .",
//     "test": "jest marketplace.spec.js --ci --reporters=default --reporters=jest-junit",
//     // "prepare": "ncc build index.js -o dist --source-map --license licenses.txt",
//     "all": "npm run lint && npm run prepare && npm run test"
//   },
//   "jest-junit": {
//     "outputDirectory": "reports",
//     "outputName": "jest-junit.xml",
//     "ancestorSeparator": " › ",
//     "uniqueOutputName": "false",
//     "suiteNameTemplate": "{filepath}",
//     "classNameTemplate": "{classname}",
//     "titleTemplate": "{title}"
//   },
//   "repository": {
//     "type": "git",
//     "url": "git+https://github.com/actions/javascript-action.git"
//   },
//   "keywords": [
//     "GitHub",
//     "Actions",
//     "JavaScript"
//   ],
//   "author": "",
//   "license": "MIT",
//   "bugs": {
//     "url": "https://github.com/actions/javascript-action/issues"
//   },
//   "homepage": "https://github.com/actions/javascript-action#readme",
//   "dependencies": {
//     "ajv": "^8.11.0",
//     "lookml-parser": "^6.5",
//     "find-duplicated-property-keys": "^1.2.7",
//     "path": "^0.12.7",
//     "@actions/core": "^1.2.5",
//     "@actions/exec": "^1.1.1"
//   },
//   "devDependencies": {
//     "@vercel/ncc": "^0.31.1",
//     "eslint": "^8.0.0",
//     "jest": "^27.2.5",
//     "jest-junit": "^14.0.1"
//   }
// }

const tests = `
// Looker Marketplace Automation Tests

const path = require("path")
const lookmlParser = require('lookml-parser')
const findDuplicatedPropertyKeys = require('find-duplicated-property-keys');
const Ajv = require('ajv')
const fs = require('fs')
const process = require('process')
const ajv = new Ajv()
const cwd = process.cwd();
const marketplaceRaw = fs.readFileSync(\`\${cwd}/marketplace.json\`, 'utf8');

try {
    var marketplace = JSON.parse(marketplaceRaw)
} catch(e) {
    console.log('marketplace is not valid json')
}

let schema = {
    type: "object",
    additionalProperties: true
  }

describe('Marketplace Automation Tests', ()=> {

    test('License File Exists', ()=> {
        const fileExists = fs.existsSync(\`\${cwd}/LICENSE\`);
        expect(fileExists).toBe(true);
    })
    test('README File Exists', ()=> {
        const fileExists = fs.existsSync(\`\${cwd}/readme.md\`);
        expect(fileExists).toBe(true);
    })
    test('Marketplace JSON Exists', ()=> {
        const fileExists = fs.existsSync(\`\${cwd}/marketplace.json\`);
        expect(fileExists).toBe(true);
    })
    test('Manifest File Exists', ()=> {
        const fileExists = fs.existsSync(\`\${cwd}/manifest.lkml\`);
        expect(fileExists).toBe(true);
    })
    test('At Least One Dashboard File Exists', ()=> {
        const files = fs.readdirSync(\`\${cwd}/dashboards/\`);
        dashboardFiles = files.filter( item => {
            return item.includes('dashboard.lookml')
        })
        expect(dashboardFiles.length).toBeGreaterThan(0);
    }) 
})

describe('Marketplace.json Schema:', ()=> {

    test('Markeplace.json contains valid JSON format.', ()=> {
        try{
            expect(JSON.parse(marketplaceRaw)).toBeDefined()
        } catch(e) {
            expect(JSON.parse(marketplaceRaw)).toThrow()
        }
    })
    test('label property exists and is valid', ()=> {
        schema = {...schema,
            properties: { label: {type: "string"}},
            required: ["label"],
        }
        const validate = ajv.compile(schema)
        const valid = validate(marketplace)
        expect(valid).toBe(true)
    })
    test('category_label property exists and is valid', ()=> {
        schema = {...schema,
            properties: { category_label: {type: "string"}},
            required: ["category_label"],
        }
        const validate = ajv.compile(schema)
        const valid = validate(marketplace)
        expect(valid).toBe(true)
    })
    test('branding property exists and is valid', ()=> {
        schema = {...schema,
            properties: { branding: {type: "object"}},
            required: ["branding"],
        }
        const validate = ajv.compile(schema)
        const valid = validate(marketplace)
        expect(valid).toBe(true)
    })
    test('models property exists and is valid', ()=> {
        schema = {...schema,
            properties: { models: {type: "array"}},
            required: ["models"],
        }
        const validate = ajv.compile(schema)
        const valid = validate(marketplace)
        expect(valid).toBe(true)
    })
    test('constants property exists and is valid', ()=> {
        schema = {...schema,
            properties: { constants: {type: "object"}},
            required: ["constants"],
        }
        const validate = ajv.compile(schema)
        const valid = validate(marketplace)
        expect(valid).toBe(true)
    })
})

describe('Testing constants:', ()=>{
    test( 'Constants Match Between Manifest and Marketplace', async ()=>{
        result = await lookmlParser.parseFiles({
            source:  \`\${cwd}/manifest.lkml\`,
            fileOutput: "by-type",
            globOptions: {},
            readFileOptions: {encoding:"utf-8"},
            readFileConcurrency: 4,
            // console: console
        })
        let manifestConst = Object.keys(result?.manifest?.constant).map( item => item)
        let marketplaceConst = Object.keys(marketplace.constants).map(item => item)
        let constMatch;
        if(JSON.stringify(manifestConst) === JSON.stringify(marketplaceConst)) {
            constMatch = true
        } else constMatch = false   
        expect(constMatch).toBe(true)

    })
    test('Marketplace constants are unique', ()=> {
    
        const result = findDuplicatedPropertyKeys(marketplaceRaw) 
        expect(result).toHaveLength(0)
    })

    test('Marketplace constants labels are unique', ()=> {
        let constantLabels = Object.keys(marketplace.constants).map(item => item.label) 
        const findDupes = array => array.filter((item, index) => array.indexOf(item) !== index)
        const dupes = findDupes(constantLabels);
        console.log('Dupes',dupes)
        expect(dupes[0]).toBe(undefined)
    })
})


describe('Verify File Extensions: ', ()=> {
    const rootFiles = fs.readdirSync(\`\${cwd}\`);
    const viewsFolderExists = fs.existsSync(\`\${cwd}/views\`)
    const exploresFolderExists = fs.existsSync(\`\${cwd}/explores\`)

    test('Model file exists and has extension .lkml', ()=> {
        modelFile = rootFiles.filter( item => {
            return item.includes('model.lkml')
        })
        expect(modelFile[0]).not.toBe(undefined)
    })
    test('Views folder exists', ()=> {
        expect(viewsFolderExists).toBe(true)
    })

    if(viewsFolderExists) {
        test('Views have extension .lkml', ()=> {
            const files = fs.readdirSync(\`\${cwd}/views\`)
            const badExtViewFiles = files.filter( item => {
                return item.includes('view') && path.extname(item) != '.lkml'
            })
            expect(badExtViewFiles.length).toBe(0)
        })
    }

    test('Explores folder exists', ()=> {
        expect(exploresFolderExists).toBe(true)
    })

    if(exploresFolderExists) {
        test('Explores have extension .lkml', ()=> {
            const files = fs.readdirSync(\`\${cwd}/explores\`)
            const badExtExploreFiles = files.filter( item => {
                return item.includes('explore') && path.extname(item) != '.lkml'
            })
            expect(badExtExploreFiles.length).toBe(0)
        })
    }
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
    // const RESULTS_FILE = join(CWD, "jest.results.json")

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

    fs.writeFile("package.json", JSON.stringify(package), (err) => {
      if (err) console.log(err);
      console.log("Successfully Written package.json to File.");
    });
}

function readWriteTestFile() {

  fs.readFile('./marketplace.spec.js', "utf8", (err, data ) => {
    fs.writeFile("marketplace.spec.js", data, (err) => {
      if (err) console.log(err);
      console.log("Successfully Written tests to File.");
    });
  })
}

run();
