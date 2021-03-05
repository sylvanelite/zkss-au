
import Au from "./globals.mjs";
import BaseMiddleware from "./middleware_base.mjs";



//use for interacting with the game model via the client-side version of the game
export default  class ClientMiddleware extends BaseMiddleware {
  constructor() {
    super();
  }
  join(id,playername){
    super.join(id,playername);
    $("#dvCurrentPlayers").attr("data-needsRefresh",true);
  }
  start(){
    super.start();
    let self = this;
    //on the client, need to start playing
    //TODO: null out fields (player and tasks) that aren't being used
    
    //on the client, need to set up the game state
    Au.state = Au.states.statePlaying;
    let txt = ".";
    if( self.model.varPlayers[Au.varPlayerId].isImposter){
        txt = "\nYou are the imposter.";
        //TODO: show other imposters
    }
    alert("Your player tag is: "+ self.model.varPlayers[Au.varPlayerId].playerTag + txt);

  }
  
  killPlayer(player,from){
    super.killPlayer(player,from);
    let self = this;
    if(player == Au.varPlayerId){
        alert("you were killed by: "+self.model.varPlayers[from].displayName);
    }
    if(from == Au.varPlayerId){
        alert("you have killed: "+self.model.varPlayers[player].displayName);
    }
    console.log("got kill",player,from);
    
  }
  
  hostMeeting(host){
    super.hostMeeting(host);
    let self = this;
    Au.state = Au.states.stateMeeting;
    Au.states.stateMeeting.varMeetingHost = host;
    Au.states.statePlaying.varMeetingCooldown = Au.TIME_BETWEEN_MEETING;
  }
  
  sabotageEvent(evt){
    super.sabotageEvent(evt);
    let self = this;
    //flag that task as being sabotaged
    let keys = Object.keys(self.model.varTasks);
    for(let i=0;i<keys.length;i+=1){
        let task = self.model.varTasks[keys[i]];
        if(task.name == evt){
            task.SabotageCooldown = Au.TIME_BETWEEN_SABOTAGE;
        }
    }
    //if you're an imposter, alert that it's been applied
    if(self.model.varPlayers[Au.varPlayerId].isImposter){
        alert("task sabotaged: "+evt);
    }
  }
  
  evtTagInfo(playerName,tag){
    super.evtTagInfo(playerName,tag);
    let self = this;
    let displayName = self.model.varPlayers[playerName].displayName;
    if(Au.state == Au.states.stateViewLog){
        let logText = displayName+", scanned: "+tag;
        Au.states.stateViewLog.varLogMessages.unshift(logText);//push message into the start of the array
    }
    
  }
  castVote(vote){
    super.castVote(vote);
    let self = this;
  }
  voteResult(result,description,playerid){
    super.voteResult(result,description,playerid);
    let self = this;        console.log("vote get");

    //this is overwritten, and is different from the client/server
    if(result == self.VOTE_RESULTS.SKIPPED){
        alert(description);
        Au.state = Au.states.statePlaying;
    }
    if(result == self.VOTE_RESULTS.TIE){
        alert(description);
        Au.state = Au.states.statePlaying;
    }
    if(result == self.VOTE_RESULTS.PLAYER_VOTED_OUT){
      alert(description);
      Au.state = Au.states.statePlaying;
      //call the super method, this does the actual killing
      //the "self" version does the alerts kill from/to, which is not needed here
        console.log("check vote kill: ",playerid);
      if(playerid==Au.varPlayerId){
        console.log("killing: ",playerid);
        super.killPlayer(playerid,"voting");
      }
    }
  }
  //TODO: this should be on the server
  clearTask(key){
    super.clearTask(key);
    let self = this;
  }
  gameOver(imposterwin,description){
    super.gameOver(imposterwin,description);
    let self=this;
    //this is overwritten, and is different from the client/server
    let result = "Innocents win, ";
    if(imposterwin){
      result = "Imposters win, ";
    }
    alert("Game over, "+result+description);
  }
  
    
}

