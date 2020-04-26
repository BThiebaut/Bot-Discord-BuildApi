const EnumType = require('../EnumType');
const Utils = require('../Utils');
const fs = require('fs');
const dbDir = "/../db";

class Gw2Build {
  static dbType = 'build';
  static addBuildRegex = /(.*)(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/;
  static getBuildNameRegex = /(.*)(?:https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/;
  static urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g;
  static getBuildRegex = /(.*) *(-force|-f|-remove|-all)/i;
  static optionsRegex = /(-force|-f|-remove|-all)/ig;
  static mentionRegex = /<@!?\d+>/g;

  name       = null;
  url        = null;
  author     = null;
  options    = null;
  args       = null;
  typeAction = null;
  mentions   = null;
  message    = null;

  constructor(message){
    this.message = message;
   }

  static testBuild(entry){
    if (entry.match(Gw2Build.addBuildRegex)){
      return EnumType.Type.TYPE_BUILD_VALID;
    }else if (entry.match(Gw2Build.getBuildRegex) && entry.indexOf('-remove') > -1) {
      return EnumType.Type.TYPE_REMOVE_BUILD;
    }else if (entry.match(Gw2Build.getBuildRegex) || entry) {
      return EnumType.Type.TYPE_GET_BUILD;
    }
    return EnumType.Type.TYPE_NOT_BUILD;
  }

  // SECTION PUBLIC //

  processBuild(author, args){
    this.typeAction = Gw2Build.testBuild(args);
    this.args = args;
    this.author = author;
    this._extractOptions();
    this._extractUrl();
    this._extractMentions();
    this._extractName();

    let returnData = null;

    switch(this.typeAction){
      case EnumType.Type.TYPE_BUILD_VALID:
          returnData = this._addProcess();
        break;
      case EnumType.Type.TYPE_GET_BUILD:
          returnData = this._getProcess();
        break;
      case EnumType.Type.TYPE_REMOVE_BUILD:
          returnData = this._removeProcess();
        break;
      default:
        throw "Aucune actions de build n'a été reconnue";
    }

    return returnData;
  }

  // END SECTION PUBLIC //

  // SECTION PRIVATE //

  _addProcess(){
    if (this.name === null){
      throw "Erreur : nom du build incorrect";
    }
    if (this.url === null){
      throw "Erreur : url du build incorrect";
    }
    if (this.author === null){
      throw "Erreur : auteur du build non fournis";
    }
    return this._add(this.author, this.name, this.url, this._hasForce);
  }

  _getProcess(){
    if (this.name === null && !this._hasAll()){
      throw "Erreur : nom du build incorrect";
    }
    return this._find(this.name, this._hasAll());
  }

  _removeProcess(){
    if (this.name === null){
      throw "Erreur : nom du build incorrect";
    }
    if (this.author === null){
      throw "Erreur : auteur du build non fournis";
    }
    return this._remove(this.author, this.name);
  }

  _compareString(str, rule){
    str = str.toLowerCase();
    rule = rule.toLowerCase();
    let escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
  }

  _extractOptions(){
    this.options = this.args.match(Gw2Build.optionsRegex);
    if (this.options !== null && this.options.length > 0){
      this.options.forEach(element => {
        this.args = this.args.replace(element, '');
      });
    }
  }

  _extractUrl(){
    let url = this.args.match(Gw2Build.urlRegex);
    if (url !== null && Utils.defined(url[0])){
      this.url = url[0].trim();
      this.args = this.args.replace(this.url, '');
      this.url = this._sanitize(this.url);
    }
  }

  _extractMentions(){
    let mentions = this.args.match(Gw2Build.mentionRegex);
    if (mentions !== null && mentions.length > 0){
      this.mentions = [];
      mentions.forEach(element => {
        this.args = this.args.replace(element, '');
        let user = this._getUserFromMention(element);
        if (user !== null){
          this.mentions.push(user);
        }
      });
    }
  }

  _extractName(){
    let name = this.args.match(Gw2Build.getBuildNameRegex);
    if (name !== null && Utils.defined(name[1])){
      this.name = this._sanitize(name[1].trim());
    }else if (this.args){
      this.name = this._sanitize(this.args.trim());
    }
  }

  _hasForce(){
    return this.options !== null && ( this.options.indexOf('-f') > -1 || this.options.indexOf('-force') > -1 );
  }

  _hasRemove(){
    return this.options !== null && this.options.indexOf('-remove') > -1;
  }

  _hasAll(){
    return this.options !== null && this.options.indexOf('-all') > -1;
  }

  _sanitize(input){
    return input.replace(/['";]/g, '');
  }

  _getUserFromMention(mention) {
    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return;
    const id = matches[1];
    return client.users.cache.get(id);
  }
  

  // END SECTION PRIVATE //

  // SECTION DB //
  _getFileName(){
    let endFileName = this.message !== null && this.message.guild ? this.message.guild.id + '_builds.json' : 'builds.json'
    return __dirname + dbDir + '/' + endFileName;
  }

  _init(){
    let fileName = this._getFileName();
    let initContent = {};

    try {
        if (!fs.existsSync(fileName)) {
            console.log('Init : Création de  ' + fileName + '.')
            let data = JSON.stringify(initContent);
            fs.writeFileSync(fileName, data);  
        }
    } catch(err) {
        console.error(err)
        throw err;
    }
  }

  _getAll(){
    try {
        this._init();
        let fileName = this._getFileName();
        let rawdata = fs.readFileSync(fileName);
        return JSON.parse(rawdata);
    } catch(err) {
        console.error(err);
        throw 'Erreur : Impossible de récupérer le contenus du fichier de sauvegarde';
    }
  }

  _getByUser(user, name){
    try {
        this._init();
        let db = this._getAll();
        let entries = Utils.defined(db[user]) ? db[user] : null;
        if (name){
          for(let entry in entries){
            if (entries[entry].name.toLowerCase() == name.toLowerCase()){
              return entries[entry];
            }
          }
          return null;
        }
        return db[user];
    } catch (e) {
        console.error(e);
        throw 'Impossible de récupérer les informations de ' + name + '. : ' + e;
    } 
  }

  _getUserByName(name){
    try {
        this._init();
        let db = this._getAll();
        let entries = Utils.defined(db[user]) ? db[user] : null;
        if (name){
          for(let entry in entries){
            if (entries[entry].author.toLowerCase() == name.toLowerCase()){
              return entries[entry];
            }
          }
          return null;
        }
        return db[user];
    } catch (e) {
        console.error(e);
        throw 'Impossible de récupérer les informations de ' + name + '. : ' + e;
    } 
  }

  _write(content){
    this._init();
    try {
        let fileName = this._getFileName();
        let finalContent = {};
        // Cleanup
        for(let user in content) {
          if (content[user] !== null){
            finalContent[user] = [];
            for(let entry in content[user]){
              if (content[user][entry] !== null){
                finalContent[user].push(content[user][entry]);
              }
            }
          }
        }
        let data = JSON.stringify(finalContent);
        fs.writeFileSync(fileName, data);  
    } catch (err) {
        console.error(err);
        throw "Erreur : impossible d'écrire dans le fichier de sauvegarde";
    }
  }

  _add(author, build, url, force){
    this._init();
    force = force === true;

    let userId = author.id;
    let db = this._getAll();
    let actual = this._getByUser(userId, build);

    if (actual !== null && !force){
      throw "Vous avez déjà ajouté un build avec ce nom. Relancer la commande avec l'option '-f' pour le remplacer";
    }else if (actual !== null && force) {
      this._remove(author, build);
    }

    if (!Utils.defined(db[userId])){
      db[userId] = [];
    }

    db[userId].push({
      name : build,
      url : url,
      author : author.username
    }); 

    this._write(db);
    
    return "Votre build a bien été ajouté";
  }

  _remove(author, name){

    try {
        this._init();
        let db = this._getAll();
        let user = author.id;
        let entries = Utils.defined(db[user]) ? db[user] : null;
        for(let entry in entries){
          if (entries[entry].name.toLowerCase() == name.toLowerCase()){
            delete db[user][entry];
            this._write(db);
            return "Le build a bien été supprimé";
          }
        }
        throw "Imposssible de supprimer le build : il n'existe pas. Vérifiez que son nom soit correct.";
    } catch (e) {
        console.error(e);
        throw 'Impossible de récupérer les informations de ' + name + '. : ' + e;
    } 
  }

  _find(build, all){
    this._init();
    all = all === true;
    let db = this._getAll();
    let finded = [];
    build = this._sanitize('*'+build+'*');
    for(let user in db){
      if ( this.mentions === null || this.mentions.indexOf(user) > -1 ){
        for(let entry in db[user]){
          if (all || this._compareString(db[user][entry].name, build)){
            finded.push(db[user][entry]);
          }
        }
      }
    }
    return finded;
  }

  // END SECTION DB //
}


module.exports = Gw2Build;