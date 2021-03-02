//get message
//TODO: connect to DB or something...

export default function(request,response,pool) {
    try{
			if(!request.query.hasOwnProperty("api")){
						rresponse.send("param not found");
			}else{        
				var api = request.query.api;
				pool.connect().then(function(client){
					return client.query(' SELECT key FROM api WHERE (key=$1) ',[api])
					.then(function(result){
										response.send(JSON.stringify(result));
					}).catch(function(err) {
						console.log(err);
						client.release();
						responseObj.success=false;
						responseObj.data="Error API lookup";
					response.send(JSON.stringify(responseObj));
					});
				}).catch(function(err){
					console.log(err);
					responseObj.success=false;
					responseObj.data="Error Connecting to DB";
					response.send(JSON.stringify(responseObj));
				});
			}       
    }catch(e){
			response.send("error: "+e);
		}
}

