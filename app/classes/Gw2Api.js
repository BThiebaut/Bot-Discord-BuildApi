const request = require('../Request');
const EnumType = require('../EnumType');
const fs = require('fs');
const tempDir = "./files";
const config = require('./../../conf.json');
const CryptoJS = require('crypto-js');
const Utils = require('../Utils');

class Gw2Api {

  static dbType = 'api';
  static baseUri = 'api.guildwars2.com';
  static keyRegex = /[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{20}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}/;

  key = null;
  message = null;

  constructor(key, message){
    this.key = key;
    this.message = message;
  }

  static getHeaders(key)
  {
    return {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Query get request to api
   * @return Promise
   */
  static query(endpoint, key)
  {
    let options = {
      headers : Gw2Api.getHeaders(key),
      host : Gw2Api.baseUri,
      path : "/v2/"+endpoint
    }
    return request.get(options);
  }

  static testKey(key){
    if (key.match(Gw2Api.keyRegex)){
      return EnumType.Type.TYPE_API_VALID;
    }
    return EnumType.Type.TYPE_NOT_API;
  }

  setKey(key){
    this.key = key;
  }

  /**
   * Test api key validity
   * @return EnumType
   */
  checkKey()
  {
      return Gw2Api.query('account', this.key);
  }

  addKey()
  {
    console.log(this.checkKey());
    this.checkKey().then(response => {
      if (!Utils.defined(response.name)){
        message.author.send("Ta clé api semble invalide, vérifie qu'elle ai le droit minimum : account");
      }

    }, err => {
      message.author.send("Arr.. Je n'arrive pas à enregistrer ta clé :(");
      console.error(err);
    })
  }

  // DB SECTION //

  
 _msgCache = "";

  __getFileName(){
      return tempDir + '/api.json';
  }

  _encrypt(data){
    return CryptoJS.AES.encrypt(data, config.encryptionKey, {iv : config.iv});
  }

  _decrypt(data){
    return CryptoJS.AES.decrypt(data, config.encryptionKey, {iv : config.iv});
  }

  _init() {
      let fileName = _getFileName();
      let initContent = {};

      try {
          if (!fs.existsSync(fileName)) {
              console.log('Init : Création de  ' + fileName + '.')
              let data = JSON.stringify(initContent);
              fs.writeFileSync(fileName, this._encrypt(data));  
          }else {
              console.log('Init : le fichier ' + fileName + ' existe déjà.')
          }
      } catch(err) {
          console.error(err)
          throw err;
      }
  }

  _getAll() {
      try {
          this._init();
          let fileName = _getFileName();
          let rawdata = fs.readFileSync(fileName);
          return JSON.parse(this._decrypt(rawdata));
      } catch(err) {
          console.error(err)
          throw 'Erreur : Impossible de récupérer le contenus du fichier de sauvegarde : ' + err;
      }
  }

  _getByUser(user, name) {
      try {
          this._init();
          let db = this._getAll();
          return Utils.defined(db[user]) ? db[user] : null;
      } catch (e) {
          throw 'Impossible de récupérer les informations de ' + name + '. : ' + e;
      } 
  }

  _getUserByName(name) {
      try {
          this._init();
          let db = this._getAll();
          let user = null;
          if (Object.keys(db).length > 0){
              for(entry in db){
                  var data = db[entry];
                  if (data.name.toLowerCase() == name.toLowerCase()){
                      user = entry;
                  }
              }
          }
          return user;
      } catch (e) {
          throw 'Impossible de récupérer l\'utilisateur pour le nom ' + name + '. : ' + e;
      } 
  }

  _writecontent() {
      this._init();
      try {
          let fileName = _getFileName();
          let data = JSON.stringify(content);
          fs.writeFileSync(fileName, this._encrypt(data));  
      } catch (err) {
          throw "Erreur : impossible d'écrire : " + err;
      }
  }

  _addToken(user, token) {
      this._init();
      let db = this._getAll();
      let actual = this._getByUser(user);

      db[user] = {
          'name' : name,
          'token' : token,
      };

      this._write(db);
      msgCache += "Votre clé a bien été ajoutée";
      return msgCache;
  }

  _remove(user, name) {
      this._init();
      let db = this._getAll();
      let actual = this._getByUser(user);
      if (actual === null){
          throw "Vous n'existez pas dans ma base de donnée";
      }

      delete db[user];
      this._write(db);
      return "Je vous ai bien oublié.. Qui êtes vous ?";
  }
  
  // END DB SECTION //
}

module.exports = Gw2Api;