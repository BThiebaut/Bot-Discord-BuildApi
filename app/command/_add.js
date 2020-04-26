const Gw2Api = require('../classes/Gw2Api');
const Gw2Build = require('../classes/Gw2Build');
const EnumType = require('../EnumType');

exports.run = (message, bot, args) => {
    return;
    let addType = testAddType(args);
    if (EnumType.isApiType(addType)){
      if (message.channel.type != 'dm'){
        message.author.send("J'ajoute ta clé, ne la donne pas en publique !");
        message.delete();
      }
      apiProcess(message, args);
    }else if (EnumType.isBuildType(addType)) {
      buildProcess(message, args);
    }else {
      message.reply("arguments invalides");
      message.reply({ embed : exports.getEmbed() });
    }
    
};

exports.getEmbed = () => {
  return {
    color: 3447003,
    title : 'Usage de la commande !add',
    description : 
      "Permet l'ajout d'information en mémoire du bot. Peut ajouter une clé api ou un build selon l'usage.\n"
      +"Usage : !add <apiKey|buildName> [buildUrl]\n"
      +"Ajout d'une clé : !add MA-CLE-API\n"
      +"Ajout d'un build : !add Nom de mon build https://UrlDeMonBuild\n",
    fields : [
      {
        name : 'apiKey',
        value : 'Clé api GW2, si vous souhaitez enregistrer votre clé'
      },
      {
        name : 'buildName',
        value : 'Nom du build à ajouter'
      },
      {
        name : 'buildUrl',
        value : 'Url du build, requis si buildName est fournis'
      },
    ],
    timestamp: new Date(),
  }
};

function testAddType(args){
  let parts = args.split(' ');
  if (parts.length == 1){
    return Gw2Api.testKey(args);
  }else {
    return Gw2Build.testBuild(args);
  }
}

async function getAddType(args){
  let parts = args.split(' ');
  if (parts.length == 1){
    let inst = new Gw2Api();
    inst.setKey(args);
    return await inst.checkKey();
  }else {
    return Gw2Build.testBuild(args);
  }
}

function apiProcess(message, args)
{
  let gw2Api = new Gw2Api(args, message);
  gw2Api.addKey();
}

function buildProcess(message, args)
{
  let isBuild = false;
  if (args.length > 0){
    let addType = getAddType(args);
      switch(addType){
        case EnumType.Type.TYPE_BUILD_VALID:
            addBuild(message.author.id, args);
            isBuild = true;
          break;
        case EnumType.Type.TYPE_BUILD_INVALID:
            message.author.send("Les arguments du build sont invalide");
            message.author.send({ embed : exports.getEmbed() });
            isBuild = true;
          break;
      }
  }
  return isBuild;
}

function addApiKey(message, key){
  message.author.send("TODO ADD API");
}

function addBuild(message, build){
  message.reply('TODO ADD BUILD');
}