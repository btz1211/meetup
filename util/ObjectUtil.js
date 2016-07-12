var ObjectUtil = function(){}

ObjectUtil.prototype.isNumberInt = function(number){
    return number === +number && number === (number|0);
}

ObjectUtil.prototype.isStringObjectId = function(string){
    if(mongoose.Types.ObjectId.isValid(string)){
      var convertedObjectId = new mongoose.Types.ObjectId(string);
      return string === convertedObjectId.toString();
    }else{
      return false;
    }
}

module.exports = ObjectUtil;
