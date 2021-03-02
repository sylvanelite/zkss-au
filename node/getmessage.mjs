//get message

export default function(request,response,client) {
	var responseObj = {
		success:false,
		data:{}
	};
    try{
			if(!request.query.hasOwnProperty("api")){
                response.send("param not found");
			}else{        
				var api = request.query.api;
                client.connect();
                client.query(' SELECT key FROM api WHERE (key=$1) ',[api])
                .then(function(result){
                    responseObj.success = true;
                    responseObj.data = JSON.stringify(result);
                    response.send(responseObj);
                }).catch(function(err) {
                    console.log(err);
                    client.release();
                    responseObj.data="Error API lookup";
                response.send(JSON.stringify(responseObj));
                });
			}       
    }catch(e){
        responseObj.data ="error: "+e;
        response.send(responseObj);
    }
}

