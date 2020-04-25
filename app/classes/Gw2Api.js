const request = require('../Request');
const EnumType = require('../EnumType');
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
  
}

module.exports = Gw2Api;