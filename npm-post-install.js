const fs = require('fs');
const confFile = './conf.json';

try {
  if (!fs.existsSync(confFile)) {
      console.log('Copy '+confFile+'.dist into '+confFile)
      let content = fs.readFileSync(confFile+'.dist');
      fs.writeFileSync(confFile, content);  
  }else {
      console.log('Conf file already exists.');
  }
} catch(err) {
  console.error('Unable to create conf file. You should create the file ' + confFile + ' using dist sample');
}