const fs = require('fs');
const tempDir = "./files";
const config = require('./../../conf.json');
const CryptoJS = require('crypto-js');
const Utils = require('../Utils');

var msgCache = "";

function getFileName(){
    return tempDir + '/db.json';
}

function encrypt(data){
  return CryptoJS.AES.encrypt(data, config.encryptionKey, {iv : config.iv});
}

function decrypt(data){
  return CryptoJS.AES.decrypt(data, config.encryptionKey, {iv : config.iv});
}

exports.init = () => {
    let fileName = getFileName();
    let initContent = {};

    try {
        if (!fs.existsSync(fileName)) {
            console.log('Init : Création de  ' + fileName + '.')
            let data = JSON.stringify(initContent);
            fs.writeFileSync(fileName, encrypt(data));  
        }else {
            console.log('Init : le fichier ' + fileName + ' existe déjà.')
        }
    } catch(err) {
        console.error(err)
        throw err;
    }
};



exports.getAll = () => {
    try {
        exports.init();
        let fileName = getFileName();
        let rawdata = fs.readFileSync(fileName);
        return JSON.parse(decrypt(rawdata));
    } catch(err) {
        console.error(err)
        throw 'Erreur : Impossible de récupérer le contenus du fichier de sauvegarde : ' + err;
    }
};

exports.getByUser = (type, user, name) => {
    try {
        exports.init();
        let db = exports.getAll();
        return Utils.defined(db[type]) && Utils.defined(db[type][user])  ? db[type][user] : null;
    } catch (e) {
        throw 'Impossible de récupérer les informations de ' + name + '. : ' + e;
    } 
};

exports.getUserByName = (name) => {
    try {
        exports.init();
        let db = exports.getAll();
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
};

exports.write = content => {
    exports.init();
    try {
        let fileName = getFileName();
        let data = JSON.stringify(content);
        fs.writeFileSync(fileName, encrypt(data));  
    } catch (err) {
        throw "Erreur : impossible d'écrire : " + err;
    }
};

exports.addToken = (user, token) => {
    exports.init();
    let db = exports.getAll();
    let actual = exports.getByUser(user);

    db[user] = {
        'name' : name,
        'token' : token,
    };

    exports.write(db);
    msgCache += "Votre clé a bien été ajoutée";
    return msgCache;
};

exports.remove = (user, name) => {
    exports.init();
    let db = exports.getAll();
    let actual = exports.getByUser(user);
    if (actual === null){
        throw "Vous n'existez pas dans ma base de donnée";
    }

    delete db[user];
    exports.write(db);
    return "Je vous ai bien oublié.. Qui êtes vous ?";
};