
import Au from "./globals.mjs";

//shared code between the client & server that handles network events
//takes in a middleware and uses it to interact with the model
//does not manipulate the model directly
//this means the model&processor can be shared between client/server,
//with only the middleware being unique
export default  class EventProcessor {
  constructor(middleware) {
    this.middleware = middleware;
  }
  
//handle events recieved over the wire 
  processEvent(evt){
    let jsonObj = JSON.parse(evt);
    switch(jsonObj.kind){
        case Au.EVENTS.JOIN:
            this.evtJoin(jsonObj);
            break;
        case Au.EVENTS.START:
            this.evtStart(jsonObj);
            break;
        case Au.EVENTS.CLEAR_TASK:
            this.evtClearTask(jsonObj);
            break;
        case Au.EVENTS.KILL:
            this.evtKill(jsonObj);
            break;
        case Au.EVENTS.MEETING:
            this.evtMeeting(jsonObj);
            break;
        case Au.EVENTS.SABOTAGE:
            this.evtSabotage(jsonObj);
            break;
        case Au.EVENTS.VOTE:
            this.evtVote(jsonObj);
            break;
        case Au.EVENTS.TAG_INFO:
            this.evtTagInfo(jsonObj);
            break;
        case Au.EVENTS.GAME_OVER:
            this.evtGameOver(jsonObj);
            break;
        case Au.EVENTS.VOTE_RESULT:
            this.evtVoteResult(jsonObj);
            break;
    }
  }
  
//join [playername,id]
//push into obj of players
  evtJoin(json){
    let self = this;
    let playername = json.playername;
    let id = json.id;
    self.middleware.join(id,playername);
  }
  
  //start [seed]
  evtStart(json){
    let self = this;
    let seed = json.seed;
    self.middleware.setSeed(seed);
    self.middleware.start();
  }
  
  //json = {key}
  //update Au.task[key] = clear (if all clear == win)
  evtClearTask(json){
    let self = this;
    let key = json.key;
    self.middleware.clearTask(key);
  }
  
  
//kill [name,from]
//--if(name == self) {kill}
  evtKill(json){
    let self = this;
    let player = json.name;
    let from = json.from;
    self.middleware.killPlayer(player,from);
  }
  
//meeting [host]
//--cancel tasks, show vote
  evtMeeting(json){
    let self = this;
    let host = json.host;
    let kills = [];
    let progress = 0;
    if(json.hasOwnProperty("kills")){
      kills = json.kills;
    }
    if(json.hasOwnProperty("progress")){
      progress = json.progress;
    }
    self.middleware.hostMeeting(host,kills,progress);
  }
  
//sabotage [event]
//--event can either be a [task_id] or a gloabl callout
  evtSabotage(json){
    let self = this;
    let evt = json.event;
    self.middleware.sabotageEvent(evt);
  }
  
//vote [name,from]
//--if (meeting) tally vote.
  evtVote(json){
    let self = this;
    self.middleware.castVote(json);
  }
  
//name, tag
  evtTagInfo(json){
    let self = this;
    let playerName = json.name;
    let tag = json.tag;
    self.middleware.evtTagInfo(playerName,tag);
  }
  //imposterwin (true/false), description
  evtGameOver(json){
    let self = this;
    let imposterwin = json.imposterwin;
    let description = json.description;
    self.middleware.gameOver(imposterwin,description);
  }
  
  //isvoteout (true/false), result middleware.VOTE_RESULT, description, playerid
  evtVoteResult(json){
    let self = this;
    let result = json.result;
    let description = json.description;
    let playerid = json.playerid;
    self.middleware.voteResult(result,description,playerid);
  }
  
}

