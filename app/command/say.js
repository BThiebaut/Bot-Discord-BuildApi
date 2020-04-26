
exports.run = (message, bot, args) => {
  return;
  switch(args){
    case 'bonjour':
      message.reply('plop');
      break;
    case 'coucou':
      message.reply('salut');
      break;
    case 'test':
      message.reply('stoi le test');
      break;
    case 'ploup':
      message.reply('TA GUEULE !');
      break;
    default:
      message.reply("Oui maître");
      break;
  }
  
};