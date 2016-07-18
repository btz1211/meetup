exports.stringify = function(json){
  var jsonString = "";
  Object.keys(json)
    .sort()
    .forEach(function(key){
      jsonString += (key + ':' + json[key] + ',');
    });

  return jsonString;
};

exports.covertArrayToObjectWithId = function(array, id){
  var json = {};
  array.map(function(item){
    json[item[id]] = item;
  });
  return json;
}
