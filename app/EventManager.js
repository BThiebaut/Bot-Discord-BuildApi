const fs = require('fs');
const dirCommand = './app/command';
const regMessage = /^!([A-z0-9]+)(.*)/;

exports.onMessage = (message, bot) => {
  messageContent = message.content;
  if (messageContent.substr(0,1) == '!'){
    try {
        let parts = messageContent.match(regMessage);
        let command = parts[1].toLowerCase();
        let args = typeof parts[2] !== typeof void(0) ? parts[2].trim() : null;

        let call = dirCommand + "/" + command + '.js';
        if (fs.existsSync(call)) {
            let c = require("./command/" + command + '.js');
            c.run(message, bot, args);
        }else {
            throw 'La commande n\'existe pas : ' + command;
        }
    } catch(err) {
        console.error(err)
    }
  }
};

exports.getAvailiableCommand = callback => {
  fs.readdir(dirCommand, (err, files) => {
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      }
      var commands = [];
      files.forEach(file => {
          file = file.replace('.js', '');
          commands.push(file);
      });
      callback(commands);
  });
};