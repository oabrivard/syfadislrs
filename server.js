function getClientAddress(request){ 
    with(request)
        return (headers['x-forwarded-for'] || '').split(',')[0] 
            || connection.remoteAddress
}


var http = require('http')
var port = process.env.PORT || 1337;
http.createServer(function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('Hello !\n');
  res.write('Your IP Address is : ' + getClientAddress(req));
  res.end('\n');
}).listen(port);