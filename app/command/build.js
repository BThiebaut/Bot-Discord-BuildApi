const db = require('../db/apidb');
const Gw2Build = require('../classes/Gw2Build');
const EnumType = require('../EnumType');

exports.run = (message, bot, args) => {
    
  if (testAddType(args)){
    try {
      let gw2Build = new Gw2Build();
      let datas = gw2Build.processBuild(message.author, args);
      switch(gw2Build.typeAction){
        case EnumType.Type.TYPE_BUILD_VALID:
        case EnumType.Type.TYPE_REMOVE_BUILD:
          message.reply(datas);
          break;
        case EnumType.Type.TYPE_GET_BUILD:
            message.reply({ embed : formatFindResults(gw2Build.name, datas) });
          break;
      }
    }catch(e){
      messages.reply(e);
    }
  }else {
    message.reply("arguments invalides");
    message.reply({ embed : exports.getEmbed() });
  }
};

exports.getEmbed = () => {
  return {
    color: 3447003,
    title : 'Usage de la commande !build',
    description : 
      "Permet l'ajout ou la récupération d'un build.\n"
      +"Usage : !build buildName [buildUrl] [-remove|-f|-force]\n"
      +"Ajout d'un build : !build Nom du build https://UrlDeMonBuild\n"
      +"Récupération d'un build : !build Nom du build\n"
      +"Supression d'un build : !build Nom du build -remove\n",
    fields : [
      {
        name : 'buildName',
        value : 'Nom du build à ajouter'
      },
      {
        name : 'buildUrl',
        value : 'Url du build si on souhaite l\'ajouter'
      },
    ],
    timestamp: new Date(),
  }
};

function formatFindResults(query, datas){
  let color = 65280,
      title = "Résultats de recherche",
      description = "",
      fields = [],
      timestamp = new Date();
  if (datas.length > 0){
    for(data in datas){
      fields.push({
        name : data.name + ' (build de ' + data.author + ')',
        value : data.url
      });
    }
  }else {
    description = "Aucun résultat pour la recherche : "+ query;
  }

  return {
    color: color,
    title : title,
    description : description,
    fields : fields,
    timestamp : timestamp
  };
}

function testAddType(args){
    return EnumType.isBuildType(Gw2Build.testBuild(args));
}