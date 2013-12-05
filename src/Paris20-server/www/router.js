var database = require("./database");

function route(pathname, data, response) {
  if (pathname == '/insert') {
	database.insert(
		new Date(), 
		data['name'].replace('<', "").replace('>', ""),
		data['type'].replace('<', "").replace('>', ""), 
		data['description']);
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end();
  } 
  else if (pathname == '/stats') {
	database.getStats(new Date(), function(err, res) {
		response.writeHead(200, {"Content-Type": "application/json"});
		response.write(JSON.stringify(res));
	    response.end();
	});
  }
  else if (pathname == '/last') {
	database.getLast(function(err, res) {
		response.writeHead(200, {"Content-Type": "application/json"});
		var jsonRes = JSON.stringify(res);
		console.log(jsonRes);
		response.write(jsonRes);
	    response.end();
	});
  }
  else {
	response.writeHead(404);  
	response.end();
  }
}

exports.route = route;