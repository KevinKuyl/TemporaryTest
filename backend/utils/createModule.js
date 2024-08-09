import fs from 'fs';
import path from 'path';

let __dirname = import.meta.url.replace('file:///', '');
const args = process.argv.slice(2);
const moduleName = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
const schema = args[1] ? args[1]
  .replace(/%N%/g, '\n')
  .replace(/ref\s*:\s*([^'",\s{}]+)/g, 'ref: "$1"')
  .replace(/default\s*:\s*([^'",\s{}]+)/g, 'default: "$1"') : false;

if (!moduleName) {
  console.log('Please specify a module name.');
  process.exit(1);
}

const modulePath = path.join(__dirname, '..', '..', 'modules', moduleName);
const moduleTemplatePath = path.join(__dirname, '..', 'Template');

if (fs.existsSync(modulePath)) {
  if (args[2] === 'overwrite') {
    // load the existing schema
    const moduleFilePath = `${modulePath}/models/${moduleName.toLowerCase()}.js`;
    if (fs.existsSync(moduleFilePath)) {
      // cant import the module so we're gonna have to do this the hard way
      const fileString = fs.readFileSync(moduleFilePath, 'utf8');
      //console.log(schema)
      let match = fileString
        .replace(/new Mongoose\.Schema\(\s*([\s\S]*?)\s*\},\s*\{/, `new Mongoose.Schema(${schema},{`)
      fs.writeFileSync(moduleFilePath, match);
    }
    process.exit(0);
  }
  else {
    console.log(`Module ${moduleName} already exists.`);
    process.exit(1);
  }
}

const copyTemplateFiles = async (templatePath, modulePath) => {
  const moduleTemplateFiles = fs.readdirSync(templatePath);
  moduleTemplateFiles.forEach(file => {
    if (file.indexOf('.') > -1) {
      let fileString = fs.readFileSync(path.join(templatePath, file), 'utf8');
      fileString = fileString.replace(/Template/g, moduleName);
      fileString = fileString.replace(/template/g, moduleName.toLowerCase());
      //replace model with the json passed in
      if (schema) {
        console.log('schema');
        fileString = fileString.replace(`%SCHEMA%`, schema);
        const s = JSON.parse(schema);
        for(const field in s) {
          if(Array.isArray(s[field].type)) {
            console.log('field', field, 'is an array!')
          }
        }
      }
      const mname = file.indexOf('Template') ? moduleName.toLowerCase() : moduleName;
      fs.writeFileSync(path.join(modulePath, `${mname}.js`), fileString);
    } else {
      fs.mkdirSync(path.join(modulePath, file));
      copyTemplateFiles(path.join(templatePath, file), path.join(modulePath, file));
    }
  });
}

// function to read application.js and add module to it
const addModuleToApplication = async (modulePath) => {
  const applicationPath = path.join(__dirname, '..', '..', 'application.js');
  let applicationString = fs.readFileSync(applicationPath, 'utf8');
  const importString = `\nimport ${moduleName} from './modules/${moduleName}/${moduleName}.js';`;
  // add importString to the imports
  const regex = /import {[\s\S]*?} from 'graphql-modules';/g;
  const res = applicationString.match(regex);
  applicationString = applicationString.replace(res[0], res[0] + importString);
  
  // find the array with modules and add the module to it
  const modulesArray = applicationString.match(/modules: \[[\s\S]*?\]/g);
  const modulesString = modulesArray[0].replace(']', `, ${moduleName}]`);
  applicationString = applicationString.replace(modulesArray[0], modulesString);
  fs.writeFileSync(applicationPath, applicationString);
}



fs.mkdirSync(modulePath);
copyTemplateFiles(moduleTemplatePath, modulePath);
addModuleToApplication(moduleName);