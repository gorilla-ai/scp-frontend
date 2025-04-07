// const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const polyToPath = (file) => {
  // const file = 'ic_arrow_left.svg';
  // const file = 'ic_user.svg';
  // const file = 'ic_add.svg';

  const filePath = path.join(__dirname, `../svg/${file}`);
  const xmlString = fs.readFileSync(filePath, 'utf8');
  const newFilePath = path.join(__dirname, `../svg.tmp/${file}`);
  // create folder first
  fs.mkdirSync(path.join(__dirname, '../svg.tmp'), { recursive: true });
  // regex to get points attribute
  const rePoints = /points="(.*?)"/gmi;
  const points = rePoints.exec(xmlString);
  if (points) { // polygon or polyline all have points attribute
    // console.log(points[0]);
    // console.log(points[1]);

    // /<polyline(.*?)<\/polyline>/gmi.test(str)
    const rePG = /<polygon(.*?)<\/polygon>/gmi;
    const rePL = /<polyline(.*?)<\/polyline>/gmi;
    // Replace <polygon or <polyline by test
    const re = (rePG.test(xmlString)) ? rePG : rePL;

    // var arr = str.replace(/<polygon(.*?)<\/polygon>/gm, '----');
    const toReplace = `<path d="M${points[1]}Z"></path>`;
    const newstr = xmlString.replace(re, toReplace);
    // console.log(xmlString);
    // console.log(newstr);
    // Write newstr to the same file
    fs.writeFileSync(newFilePath, newstr);
  } else {
    fs.writeFileSync(newFilePath, xmlString);
  }
};

// const parser = new xml2js.Parser({ attrkey: 'ATTR' });
const svgDirectoryPath = path.join(__dirname, '../svg');
try {
  const files = fs.readdirSync(svgDirectoryPath);
  files.forEach((file) => {
    polyToPath(file);
    // writeDim(file).catch((error) => { console.log(`Cannot write ${file}`, err); });
    // writeMuiSvgIcon(file).catch((error) => { console.log(`Cannot write tpl ${file}`, err); });
  });
} catch (error) {
  console.log(`Unable to scan directory: ${error}`);
}
