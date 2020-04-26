const Gw2Build = require('../classes/Gw2Build');
const EnumType = require('../EnumType');

const deleteTimeout = 40000;

exports.run = (message, bot, args) => {
    
  if (testAddType(args)){
    try {
      let gw2Build = new Gw2Build(message);
      let datas = gw2Build.processBuild(message.author, args);
      switch(gw2Build.typeAction){
        case EnumType.Type.TYPE_BUILD_VALID:
        case EnumType.Type.TYPE_REMOVE_BUILD:
          message.reply(datas).then(msg=>{
            msg.delete({ timeout : (deleteTimeout / 2) });
          });
          break;
        case EnumType.Type.TYPE_GET_BUILD:
            message.reply({ embed : formatFindResults(gw2Build, datas) }).then(msg=>{
              let time = parseInt(datas.length > 3 ? deleteTimeout * (datas.length / 2) : deleteTimeout);
              msg.delete({ timeout : time });
            });
          break;
      }
    }catch(e){
      if (typeof e == "string"){
        message.reply(e).then(msg=>{
          msg.delete({ timeout : deleteTimeout });
        });
      }
      console.error(e);
    }
  }else {
    message.reply({ embed : exports.getEmbed() }).then(msg=>{
      msg.delete({ timeout : deleteTimeout*2 });
    });
  }
  message.delete();
};

exports.getEmbed = () => {
  return {
    color: 3447003,
    title : 'Usage de la commande !build',
    description : 
      "Permet l'ajout ou la récupération d'un build.\n"
      +"Usage : !build buildName [buildUrl] [-remove|-f|-force|-all]\n",
    fields : [
      {
        name : 'buildName',
        value : 'Nom du build à ajouter'
      },
      {
        name : 'buildUrl',
        value : 'Url du build si on souhaite l\'ajouter'
      },
      {
        name : 'Exemple : Ajout d\'un build',
        value : '!build Nom du build https://UrlDeMonBuild'
      },
      {
        name : 'Exemple : Récupération d\'un build',
        value : '!build Nom du build'
      },
      {
        name : 'Exemple : Supression d\'un build dont vous êtes l\'auteur',
        value : '!build Nom du build -remove'
      },
    ],
    timestamp: new Date(),
    footer: {
      text: "Ce message s'autodétruira dans " + ( (deleteTimeout*2) / 1000) + " secondes",
    },
  }
};

function formatFindResults(instance, datas){
  let query = instance.name !== null ? instance.name : '';
  let color = 65280,
      title = instance.mentions === null ? "Résultats de recherche" : "Résultats de recherche pour l'utilisateur " + instance.mentions.map(e => { return "<@" + e + ">" }).join(' ') ,
      description = 'Affichage des résultats pour la recherche "'+ query +'"',
      fields = [],
      timestamp = new Date();
  if (datas.length > 25){
    // Embed limit to 25 fields
    datas.length = 25;
  }
  if (datas.length > 0){
    for(let data in datas){
      let entry = datas[data];
      fields.push({
        name : entry.name + ' (ajouté par ' + entry.author + ')',
        value : entry.url
      });
    }
  }else {
    if (query !== '-all'){
      description = "Aucun résultat pour la recherche : "+ query;
    }else {
      description = "Aucun build n'a été enregistré pour le moment";
    }
    color = 16711680;
  }

  let time = parseInt((datas.length > 3 ? deleteTimeout * (datas.length / 2) : deleteTimeout)) / 1000;

  return {
    color: color,
    title : title,
    description : description,
    fields : fields,
    timestamp : timestamp,
    footer: {
      text: "Ce message s'autodétruira dans " + time + " secondes",
    },
  };
}

function testAddType(args){
    return EnumType.isBuildType(Gw2Build.testBuild(args));
}
