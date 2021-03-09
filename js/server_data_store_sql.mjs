
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

import BaseServerDataStore from "./server_data_store_base.mjs";

export default class ServerDataStore extends BaseServerDataStore {
  constructor(client) {
    super();
    this.client = client;
  }
  async getState (area){
    //retrieve model from the database
    let doc_name = "zkss_"+area;
    return this.client.query('  SELECT name, content FROM documents '+
								  ' WHERE  name=$1 ',[doc_name]);
  }
  async saveState (area,state){ 
    let doc_name = "zkss_"+area;
    let doc_state = state;
    return this.client.query('  INSERT INTO documents (name, content) '+
            ' VALUES ($1, $2) ON CONFLICT (name) DO UPDATE '+
            ' SET content=$2 WHERE documents.name=$1',[doc_name,doc_state]);
  }
  async resetState () { 
  	return this.client.query(" DELETE FROM documents where name like 'zkss_%' " );
  }
  async resetMessages (){
    return this.client.query(' DELETE FROM messages ' );
  }
  async saveMessage (message,area,playerId){ 
    return this.client.query(' INSERT INTO messages(message,area,pid) values ($1,$2,$3) ',[message,area,playerId]);
  }
  async getMessages (id,area){
    return this.client.query('SELECT id,message,pid FROM messages where id > $1 and area = $2 ORDER BY id  ',[id,area]);
  }
  async connect(){
    return this.client.connect();
  }
  async end(){
    return this.client.end();
  }
}


