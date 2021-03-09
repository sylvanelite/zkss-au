//get message


import ServerMiddleware from "../js/middleware_server.mjs";
import EventProcessor from "../js/event_processor.mjs";
import ServerDataStore from "../js/server_data_store_base.mjs";

/*
Table structure (postgres)
CREATE TABLE messages (id SERIAL PRIMARY KEY, message text, area text, pid text)


CREATE TABLE documents
(
    name character varying(100) NOT NULL,
    content text NOT NULL,
    CONSTRAINT document_name UNIQUE (name)
)

*/

let getServerId = function(){
	//this is just a key to flag that messages are from the server
	//it just has to be a value that can't be generated by a client
	//messages with this pid will not be filtered
	//in theory, this could be made more secure by randomising each reset and storing in model
	//also an environment var could be used to make it configurable
	//for now this will suffice
	return "server__server";
};

export default async function(request,response,client) {
	var responseObj = {
		success:false,
		data:{}
	};
    try{
		let params = request.body;
		if(!params.hasOwnProperty("kind")||
			!params.hasOwnProperty("area")||
			!params.hasOwnProperty("pid")){
			responseObj.data = "missing parameter";
			response.send(responseObj);
			return;
		}
		let kind = params.kind;
		let area = params.area;
		let playerId = params.pid;
		let dataStore = new ServerDataStore(client);
		await dataStore.connect();
		
		if(kind=="reset"){
			//TODO: nukes the whole table....
			
			//generate an empty model for population later
			let serverData = new ServerMiddleware();
			await dataStore.resetState();
			await dataStore.resetMessages();
			await dataStore.saveState(area,serverData.model);
			
			
			responseObj.success = true;
			responseObj.data = "reset successful";
		}
		if(kind == "send"){
			if(!params.hasOwnProperty("message")){
				responseObj.data = "unkonwn message";
				response.send(responseObj);
				await dataStore.end();
				return;
			}
			let message = params.message;
			await dataStore.saveMessage(message,area,playerId);
			let dbModelResult = await dataStore.getState(area);
			let dbModel = JSON.parse(dbModelResult.rows[0].content);
			let serverData = new ServerMiddleware();
			serverData.model = dbModel;
			let eventProcessor = new EventProcessor(serverData);
			eventProcessor.processEvent(message);
			for(let i=0;i<serverData.internalMessageBuffer.length;i+=1){
				let serverMsg =serverData.internalMessageBuffer[i];
				await dataStore.saveMessage(serverMsg,area,getServerId());
			}
			await dataStore.saveState(area,serverData.model);
			
			responseObj.success = true;
			responseObj.data = "added message";
			response.send(responseObj);
		}
		
		if(kind == "get"){
			if(!params.hasOwnProperty("id") ){
				responseObj.data = "unkonwn id";
				response.send(responseObj);
				await dataStore.end();
				return;
			}
			let id = params.id;
			let result = await dataStore.getMessages(id,area);
			let resultData = result.rows;
			if(resultData.length>0){
				let dbModelResult = await dataStore.getState(area);
				let dbModel = JSON.parse(dbModelResult.rows[0].content);
				let serverData = new ServerMiddleware();
				serverData.model = dbModel;
				for(let i=resultData.length-1;i>=0;i-=1){
					let msgToValidate = resultData[i];
					let canBeSent = serverData.messageCanBeSent(msgToValidate.message,playerId,msgToValidate.pid,getServerId());
					if(!canBeSent){
						resultData.splice(i,1);
					}
				}
			}
			
			responseObj.success = true;
			responseObj.data = resultData;
			response.send(responseObj);			
		}
		await dataStore.end();
    }catch(e){
        responseObj.data ="error: "+e;
        response.send(responseObj);
    }
}

