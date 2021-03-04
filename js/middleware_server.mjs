
import BaseMiddleware from "./middleware_base.mjs";
//use for interacting with the game model via the client-side version of the game
export default  class ServerMiddleware extends BaseMiddleware {
  constructor() {
    super();
  }
  
  clearTask(key){
    super.clearTask(key);
    let self = this;
    //TODO: change this to send a message to the players instead of alert
    //check all tasks are clear, if so, end game
    let allClear = true;
    let keys = Object.keys(self.model.varTasks);
    for(let i=0;i<keys.length;i+=1){
        let task = self.model.varTasks[keys[i]];
        if(!task.isClear){
            allClear = false;
            break;
        }
    }
    if(allClear){
        alert("Innocents win! All tasks clear!");//TODO: better win/loss mechanic (reveal imposter, etc)
    }
    
    
  }
  
  killPlayer(player,from){
    super.killPlayer(player,from);
    let self = this;
    //TODO: change this to send a message to the players instead of alert
    //check number of alive
    let aliveCount = 0;
    let imposterCount = 0;
    let keys = Object.keys(self.model.varPlayers);
    for(let i=0;i<keys.length;i+=1){
        let player = self.model.varPlayers[keys[i]];
        if(player.isAlive){
            aliveCount+=1;
        }
        if(player.isImposter){
            imposterCount+=1;
        }
    }
    if(imposterCount>=aliveCount){
        alert("Game over, imposters win");
        //TODO: better game over
    }
    if(imposterCount<=0){
        alert("Game over, imposters lose");
    }
  }
  
  castVote(vote){
    super.castVote(vote);
    let self = this;
    //TODO: call tallyVotes server-side? for now it's done client-side.
  }
  
  
}

