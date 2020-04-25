const request = require('../Request');
const EnumType = require('../EnumType');
const Utils = require('../Utils');

class Gw2Build {
  static dbType = 'build';
  static buildRegex = /(.*)(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/;
  static urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/;

  name = null;
  url = null;

  constructor(){
   }

  static testBuild(entry){
    let parts = entry.match(this.buildRegex);
    if (Utils.defined(parts[1]) && parts[1].match(/.*/) && Utils.defined(parts[2]) && parts[2].match(urlRegex)){
      return EnumType.Type.TYPE_BUILD_VALID;
    }else if (parts.length > 1) {
      return EnumType.Type.TYPE_BUILD_INVALID;
    }
    return EnumType.Type.TYPE_NOT_BUILD;
  }
}


module.exports = Gw2Build;