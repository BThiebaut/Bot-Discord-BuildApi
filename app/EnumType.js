
exports.Type = class {
  static TYPE_API_VALID     = 1;
  static TYPE_API_INVALID   = 2;
  static TYPE_NOT_API       = 3;
  static TYPE_BUILD_VALID   = 4;
  static TYPE_BUILD_INVALID = 5;
  static TYPE_NOT_BUILD     = 6;
  static TYPE_GET_BUILD     = 7;
  static TYPE_REMOVE_BUILD  = 8;
}

exports.isApiType = type => {
  return type == exports.Type.TYPE_API_INVALID || type == exports.Type.TYPE_API_VALID;
}

exports.isBuildType = type => {
  return type == exports.Type.TYPE_BUILD_INVALID || type == exports.Type.TYPE_BUILD_VALID || type == exports.Type.TYPE_GET_BUILD || type == exports.Type.TYPE_REMOVE_BUILD;
}