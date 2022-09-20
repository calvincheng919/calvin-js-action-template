
// Looker Marketplace Automation Tests

const lookmlParser = require('lookml-parser')
const findDuplicatedPropertyKeys = require('find-duplicated-property-keys');
const Ajv = require('ajv')
const fs = require('fs')
const process = require('process')
const ajv = new Ajv()
// process.chdir('../')
const cwd = process.cwd();
const marketplaceRaw = fs.readFileSync(`${cwd}/marketplace.json`, 'utf8');

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
        const fileExists = fs.existsSync(`${cwd}/LICENSE`);
        expect(fileExists).toBe(true);
    })
    test('READEME File Exists', ()=> {
        const fileExists = fs.existsSync(`${cwd}/readme.md`);
        expect(fileExists).toBe(true);
    })
    test('Marketplace JSON Exists', ()=> {
        const fileExists = fs.existsSync(`${cwd}/marketplace.json`);
        expect(fileExists).toBe(true);
    })
    test('Manifest File Exists', ()=> {
        const fileExists = fs.existsSync(`${cwd}/manifest.lkml`);
        expect(fileExists).toBe(true);
    })
    test('At Least One Dashboard File Exists', ()=> {
        const files = fs.readdirSync(`${cwd}/dashboards/`);
        dashboardFiles = files.filter( item => {
            return item.includes('dashboard.lookml')
        })
        expect(dashboardFiles.length).toBeGreaterThan(0);
    }) 
})
