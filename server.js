function getClientAddress(request){ 
    with(request)
        return (headers['x-forwarded-for'] || '').split(',')[0] 
            || connection.remoteAddress
}

var async = require('async');
var mongoose = require('mongoose');
var http = require('http')
var port = process.env.PORT || 1337;

var connectionSchema = new mongoose.Schema({
	ipAddress : String,
	count : { type : Number, default : 0 }
});

http.createServer(function(req, res) {

	var ipAddress = getClientAddress(req);
	var count = 0;
	var connectionModel = null;
	
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.write('Hello !\n');
	res.write('Your IP Address is : ' + ipAddress);
	
	async.series([				
	    function(callback){
			mongoose.connect('mongodb://localhost/connections', function(err) {
				if (err) { callback(err, ''); }
				
				connectionModel = mongoose.model('connection', connectionSchema);

				callback(null, '');
			});
	    },

	    function(callback){	
			connectionModel.findOne({ ipAddress: ipAddress }, function (err, doc) {
				if (err) { callback(err, ''); }
				
				if (doc!==null)
					count = doc.count;

				callback(null, '');
			});
	    },
	    
	    function(callback){	
			if (count > 0)
			{	
				console.log("Count : " + count);
				connectionModel.update({ ipAddress: ipAddress }, { count: count+1 }, function (err, numberAffected, raw) {
					if (err) { callback(err, ''); }
					console.log('The number of updated documents was %d', numberAffected);
					callback(null, '');					
				});
			}
			else
			{
				console.log("Not found");
				connectionModel.create({ ipAddress: ipAddress, count: 1 }, function (err, connection) {
					if (err) { callback(err, ''); }
					console.log('A new connection was registered : ' + ipAddress);
					callback(null, '');					
				});
			}
	    },
	],
	function(err, results) {
		mongoose.connection.close();
	
		res.write('\nNumber of accesses with the same IP address before yours : ' + count.toString());
		res.end('\n');	

		if (err!=null && typeof err !== 'undefined')
			console.log( err );
	});
	
}).listen(port);