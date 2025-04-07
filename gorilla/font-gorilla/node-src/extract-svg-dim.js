const path = require('path');
const fs = require('fs');
const extract = require('extract-svg-path');

let tpl;

const writeMuiSvgIcon = async (file) => {
  const filename = file.split('.')[0];
  try {
    await fs.promises.writeFile(path.join(__dirname, `../src/muiSvgIcons/${filename}.jsx`), tpl.replace('---THE-FILE-NAME---', filename));
  } catch (error) {
    console.error(`Cannot write tpl ${file}`, error);
  }
};

const writeDim = async (file) => {
  // console.log('location:', `${__dirname}/svg/${file}`);
  const filePath = path.join(__dirname, `../svg.tmp/${file}`);
  const dim = extract(filePath);
  const filename = file.split('.')[0];
  // console.log('file:', file);
  // console.log('dim:', dim);
  // console.log('filename:', filename);
  try {
    await fs.promises.writeFile(path.join(__dirname, `../src/dim/${filename}.js`), `export default '${dim}';`);
  } catch (error) {
    console.log(`Cannot write ${file}`, error);
  }
};

const readAllSvg = () => {
  // joining path of directory
  const directoryPath = path.join(__dirname, '../svg.tmp');
  // passsing directoryPath and callback function
  fs.readdir(directoryPath, (err, files) => {
    // handling error
    if (err) {
      return console.log(`Unable to scan directory: ${err}`);
    }

    files.forEach((file) => {
      writeDim(file).catch((error) => { console.log(`Cannot write ${file}`, err); });
      writeMuiSvgIcon(file).catch((error) => { console.log(`Cannot write tpl ${file}`, err); });
    });
  });
};

const getTpl = async () => {
  const rs = await fs.promises.readFile(path.join(__dirname, '../assets/tpl.jsx'), 'utf8');
  return rs;
};

getTpl()
  .then((data) => {
    // console.log('tpl', tpl);
    // console.log(tpl.replace('---THE-FILE-NAME---', 'ic_users.svg'));
    // console.log(tpl);
    tpl = data;
    readAllSvg();
  })
  .catch((error) => {
    console.error('Error occured while reading tpl file!', error);
  });
