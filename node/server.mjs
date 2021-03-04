//get message


import ServerMiddleware from "../js/middleware_server.mjs";
import EventProcessor from "../js/event_processor.mjs";

/*
Table structure (postgres)
CREATE TABLE messages (id SERIAL PRIMARY KEY, message text, area text)


CREATE TABLE documents
(
    name character varying(100) NOT NULL,
    content text NOT NULL,
    CONSTRAINT document_name UNIQUE (name)
)


*/


let getState  = async function (area,client){
	//retrieve model from the database
	let doc_name = "zkss_"+area;
	return client.query('  SELECT name, content FROM documents '+
								  ' WHERE  name=$1 ',[doc_name]);
	
};
let saveState = async function (area,state,client){
	let doc_name = "zkss_"+area;
	let doc_state = state;
	return client.query('  INSERT INTO documents (name, content) '+
            ' VALUES ($1, $2) ON CONFLICT (name) DO UPDATE '+
            ' SET content=$2 WHERE documents.name=$1',[doc_name,doc_state]);
};


export default async function(request,response,client) {
	var responseObj = {
		success:false,
		data:{}
	};
    try{
		
		let params = request.body;
		if(!params.hasOwnProperty("kind")||
			!params.hasOwnProperty("area")){
			responseObj.data = "missing parameter";
			response.send(responseObj);
			return;
		}
		let kind = params.kind;
		let area = params.area;
		await client.connect();
		
		if(kind=="reset"){
			//TODO: nukes the whole table....
			
			//generate an empty model for population later
			let serverData = new ServerMiddleware();
			
			await client.query(' DELETE FROM messages ' );
			await client.query(" DELETE FROM documents where name like 'zkss_%' " );
			await saveState(area,serverData.model,client);
			
			
			responseObj.success = true;
			responseObj.data = "reset successful";
		}
		if(kind == "send"){
			if(!params.hasOwnProperty("message")){
				responseObj.data = "unkonwn message";
				response.send(responseObj);
				client.end();
				return;
			}
			let message = params.message;
			let dbModelResult = await getState(area,client);
			let dbModel = JSON.parse(dbModelResult.rows[0].content);
			//console.log(dbModel);
			let serverData = new ServerMiddleware();
			serverData.model = dbModel;
			let eventProcessor = new EventProcessor(serverData);
			eventProcessor.processEvent(message);
			await saveState(area,serverData.model,client);
			
			
			await client.query(' INSERT INTO messages(message,area) values ($1,$2) ',[message,area]);
			responseObj.success = true;
			responseObj.data = "added message";
			response.send(responseObj);
		}
		
		if(kind == "get"){
			if(!params.hasOwnProperty("id") ){
				responseObj.data = "unkonwn id";
				response.send(responseObj);
				client.end();
				return;
			}
			let id = params.id;
			let result = await client.query('SELECT id,message FROM messages where id > $1 and area = $2 ORDER BY id  ',[id,area]);
			responseObj.success = true;
			responseObj.data = result.rows;
			response.send(responseObj);			
		}
		client.end();
    }catch(e){
        responseObj.data ="error: "+e;
        response.send(responseObj);
    }
}

