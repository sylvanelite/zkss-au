//get message
//TODO: connect to DB or something...

export default function(request,pool) {
    let res = "this is some code";
    try{
        
	if(request.query.hasOwnProperty("api")){
        res += "param not found";
	}else{        
		var api = request.query.api;
		pool.connect().then(function(client){
			return client.query(' SELECT key FROM api WHERE (key=$1) ',[api])
			.then(function(result){
                res+= (JSON.stringify(result));
		 
         
		  }).catch(function(err) {
			  console.log(err);
			  client.release();
			  responseObj.success=false;
			  responseObj.data="Error API lookup";
			res+= (JSON.stringify(responseObj));
		  });
		}).catch(function(err){
			console.log(err);
			responseObj.success=false;
			responseObj.data="Error Connecting to DB";
			res+= (JSON.stringify(responseObj));
		});
    }       
    }catch(e){res+="error: "+e;}
  return res;
}

