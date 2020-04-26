
exports.run = (message, bot, args) => {
  console.log(args);
  switch(args){
    case 'bonjour':
      message.reply('plop');
    case 'coucou':
      message.reply('salut');
    case 'test':
      message.reply('stoi le test');
    case 'ploup':
      message.reply('TA GUEULE !');
    default:
      message.reply("Oui maître");
  }
  
};