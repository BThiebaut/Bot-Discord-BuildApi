const EnumType = require('../EnumType');
const Utils = require('../Utils');
const fs = require('fs');
const dbDir = "../db";

class Gw2Build {
  static dbType = 'build';
  static addBuildRegex = /(.*)(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/;
  static getBuildNameRegex = /(.*)(?:https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/;
  static urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g;
  static getBuildRegex = /(.*) *(-remove|-f|-force)/i;
  static optionsRegex = /(-force|-f|-remove)/ig;

  name       = null;
  url        = null;
  author     = null;
  options    = null;
  args       = null;
  typeAction = null;

  constructor(){
   }

  static testBuild(entry){
    if (entry.match(this.addBuildRegex)){
      return EnumType.Type.TYPE_BUILD_VALID;
    }else if (entry.match(this.getBuildRegex) && entry.indexOf('-remove') > -1) {
      return EnumType.Type.TYPE_REMOVE_BUILD;
    }else if (entry.match(this.getBuildRegex)) {
      return EnumType.Type.TYPE_GET_BUILD;
    }else if (entry){
      return EnumType.Type.TYPE_BUILD_INVALID;
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
    return this._add(this.author, this.name, this.url);
  }

  _getProcess(){
    if (this.name === null){
      throw "Erreur : nom du build incorrect";
    }
    return this._find(this.name);
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
    this.options = this.args.match(optionsRegex);
    if (this.options !== null && this.options.length > 0){
      this.options.forEach(element => {
        this.args = this.args.replace(element, '');
      });
    }
  }

  _extractUrl(){
    let url = this.args.match(urlRegex);
    if (Utils.defined(url[0])){
      this.url = url[0].trim();
      this.args = this.args.replace(this.url, '');
    }
  }

  _extractName(){
    let name = this.args.match(getBuildNameRegex);
    if (name !== null && Utils.defined(name[1])){
      this.name = name[1].trim();
    }else if (this.args){
      this.name = this.args.trim();
    }
  }

  _hasForce(){
    return this.options !== null && ( this.options.indexOf('-f') > -1 || this.options.indexOf('-force') > -1 );
  }

  _hasRemove(){
    return this.options !== null && this.options.indexOf('-remove') > -1;
  }
  // END SECTION PRIVATE //

  // SECTION DB //
  _getFileName(){
    return dbDir + '/builds.json';
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
          for(entry in entries){
            if (entry.name.toLowerCase() == name.toLowerCase()){
              return entry;
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
          for(entry in entries){
            if (entry.author.toLowerCase() == name.toLowerCase()){
              return entry;
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
        let data = JSON.stringify(content);
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

    db[user].push({
      name : build,
      url : url,
      author : author.username
    }); 

    this._write(db);
    
    return "Votre build a bien été ajouté";
  }

  _remove(author, build){
    this._init();
    let db = this._getAll();
    let actual = this._getByUser(author.id, build);
    if (actual === null){
        throw "Imposssible de supprimer le build : il n'existe pas. Vérifiez que son nom soit correct.";
    }
    delete actual;
    this._write(db);
    return "Le build a bien été supprimé";
  }

  _find(build){
    this._init();
    let db = this._getAll();
    let finded = [];
    for(user in db){
      for (entry in user){
        if (this._compareString(entry.name, build)){
          finded.push(entry);
        }
      }
    }
    return finded;
  }
  // END SECTION DB //

 

}


module.exports = Gw2Build;