const fs = require('fs');
const dirCommand = './app/command';
const regMessage = /^!([A-z0-9]+)(.*)/;

exports.onMessage = (message, bot) => {
  messageContent = message.content;
  if (messageContent.substr(0,1) == '!'){
    try {
        let parts = messageContent.match(regMessage);
        if (parts !== null){
            let command = parts[1].toLowerCase();
            command = _sanitizeCommand(command);
            if (command == 'help' || command == 'aide'){
                exports.sendCommandLists(message, command);
                return;
            }
            let args = typeof parts[2] !== typeof void(0) ? parts[2].trim() : null;
            console.log(args);
            let call = dirCommand + "/" + command + '.js';
            if (fs.existsSync(call)) {
                let c = require("./command/" + command + '.js');
                c.run(message, bot, args);
            }else {
                throw 'La commande n\'existe pas : ' + command;
            }
        }
    } catch(err) {
        console.error(err);
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

exports.sendCommandLists = (message, source) => {
 exports.getAvailiableCommand(commands => {
     let fields = [];
     let other = source == 'help' ? 'aide' : 'help';
     commands.forEach(element => {
         if (element.substr(0, 1) !== '_'){
             fields.push({
                 name : element,
                 value : "Utilisez !" + element + " sans paramètres pour voir l'usage de cette commande"
             });
         }
     });
    let embed = {
        color: 3447003,
        title : 'Liste des commandes disponibles',
        description : "Pour plus d'informations, utilisez !"+other,
        fields : fields,
        timestamp: new Date(),
    };
    message.reply({ embed : embed });
 });
}

function _sanitizeCommand(command){
    return command.replace(/[^[a-zA-Z0-9-]]/, '');
}