exports.stringify = function(json){
  var jsonString = "";
  Object.keys(json)
    .sort()
    .forEach(function(key){
      jsonString += (key + ':' + json[key] + ',');
    });

  return jsonString;
};

exports.covertArrayToObjectWithId = function(array, key){
  var json = {};
  array.map(function(item){
    json[item[key]] = item;
  });
  return json;
}
