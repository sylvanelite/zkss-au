//get message
//TODO: connect to DB or something...

export default function(request,response,client) {
    try{
			if(!request.query.hasOwnProperty("api")){
						response.send("param not found");
			}else{        
				var api = request.query.api;
                client.connect();
                client.query(' SELECT key FROM api WHERE (key=$1) ',[api])
                .then(function(result){
                                    response.send(JSON.stringify(result));
                }).catch(function(err) {
                    console.log(err);
                    client.release();
                    responseObj.success=false;
                    responseObj.data="Error API lookup";
                response.send(JSON.stringify(responseObj));
                });
			}       
    }catch(e){
			response.send("error: "+e);
		}
}

