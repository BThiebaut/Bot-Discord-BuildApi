const Discord = require('discord.js');
const config = require('./conf.json');
const eventManager = require('./app/EventManager');

const bot = new Discord.Client();

bot.on('ready', function () {
  console.log("Bot connecté")
});

bot.login(config.token);

bot.on('message', message => {
  eventManager.onMessage(message, bot);
})