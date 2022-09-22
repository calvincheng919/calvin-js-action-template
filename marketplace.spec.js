 
// Looker Marketplace Automation Tests

const path = require("path")
const lookmlParser = require('lookml-parser')
const findDuplicatedPropertyKeys = require('find-duplicated-property-keys');
const Ajv = require('ajv')
const fs = require('fs')
const process = require('process')
const ajv = new Ajv()
process.chdir('../')
const cwd = process.cwd();
const marketplaceRaw = fs.readFileSync(`${cwd}/main/marketplace.json`, 'utf8');

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
        const fileExists = fs.existsSync(`${cwd}/main/LICENSE`);
        expect(fileExists).toBe(true);
    })
    test('README File Exists', ()=> {
        const fileExists = fs.existsSync(`${cwd}/main/README.md`);
        expect(fileExists).toBe(true);
    })
    test('Marketplace JSON Exists', ()=> {
        const fileExists = fs.existsSync(`${cwd}/main/marketplace.json`);
        expect(fileExists).toBe(true);
    })
    test('Manifest File Exists', ()=> {
        const fileExists = fs.existsSync(`${cwd}/main/manifest.lkml`);
        expect(fileExists).toBe(true);
    })
    test('At Least One Dashboard File Exists', ()=> {
        const files = fs.readdirSync(`${cwd}/main/dashboards/`);
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
            source:  `${cwd}/main/manifest.lkml`,
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
    const rootFiles = fs.readdirSync(`${cwd}/main`);
    const viewsFolderExists = fs.existsSync(`${cwd}/main/views`)
    const exploresFolderExists = fs.existsSync(`${cwd}/main/explores`)

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
            const files = fs.readdirSync(`${cwd}/main/views`)
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
            const files = fs.readdirSync(`${cwd}/main/explores`)
            const badExtExploreFiles = files.filter( item => {
                return item.includes('explore') && path.extname(item) != '.lkml'
            })
            expect(badExtExploreFiles.length).toBe(0)
        })
    }
})
