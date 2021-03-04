//get message

/*
Table structure (postgres)
CREATE TABLE messages (id SERIAL PRIMARY KEY, message text, area text)
*/

export default function(request,response,client) {
	var responseObj = {
		success:false,
		data:{}
	};
    try{
		let params = request.body;
			if(!params.hasOwnProperty("kind") ){
				responseObj.data = "missing parameter";
                response.send(responseObj);
			}else{
				let kind = params.kind;
				let area = params.area;
				let message = params.message;
				
				if(kind=="reset"){
					//TODO: nukes the whole table....
						client.connect().then( function(){
								client.query(' DELETE FROM messages ' )
								.then(function(){
									responseObj.success = true;
									responseObj.data = "reset successful";
									client.end();
									response.send(responseObj);
								}).catch(function(err) {
									console.log(err);
									client.end();
									responseObj.data="Error reset";
									response.send(JSON.stringify(responseObj));
								});
							}
						).catch(function(err){
							responseObj.data ="error: "+err;
							response.send(responseObj);
						});
				}
				if(kind == "send"){
					if(!params.hasOwnProperty("area")||
					   !params.hasOwnProperty("message")){
						responseObj.data = "missing send parameter";
						response.send(responseObj);
					}else{
						client.connect().then(
							function(){
								client.query(' INSERT INTO messages(message,area) values ($1,$2) ',[message,area])
								.then(function(){
									responseObj.success = true;
									responseObj.data = "added message";
									client.end();
									response.send(responseObj);
								}).catch(function(err) {
									console.log(err);
									client.end();
									responseObj.data="Error send";
									response.send(JSON.stringify(responseObj));
								});
							}
						).catch(function(err){
							responseObj.data ="error: "+err;
							response.send(responseObj);
						});
					}
				}
				if(kind == "get"){
					if(!params.hasOwnProperty("id") ){
						responseObj.data = "unkonwn id";
						response.send(responseObj);
					}else{
						let id = params.id;
						client.connect().then(
							function(){
								client.query('SELECT id,message FROM messages where id > $1 and area = $2 ORDER BY id  ',[id,area])
								.then(function(result){
									responseObj.success = true;
									responseObj.data = result.rows;
									client.end();
									response.send(responseObj);
								}).catch(function(err) {
									console.log(err);
									client.end();
									responseObj.data="Error get";
									response.send(JSON.stringify(responseObj));
								});
							}
						).catch(function(err){
							responseObj.data ="error: "+err;
							response.send(responseObj);
						});
					}
					
				}
					
				
			}
    }catch(e){
        responseObj.data ="error: "+e;
        response.send(responseObj);
    }
}

