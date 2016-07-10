exports.stringify = function(json){
  var jsonString = "";
  Object.keys(json)
    .sort()
    .forEach(function(key){
      jsonString += (key + ':' + json[key] + ',');
    });

  return jsonString;
}
