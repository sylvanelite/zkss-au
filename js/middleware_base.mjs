
import Au from "./globals.mjs";
import Model from "./model.mjs";
//use for interacting with the game model via the client-side version of the game
export default  class BaseMiddleware {
  constructor() {
    this.model = new Model();
    this.seed = 42;
    
    this.VOTE_RESULTS={
      SKIPPED:"SKIPPED",
      TIE:"TIE",
      INTERIM:"INTERIM",
      IMPOSTER_WIN:"IMPOSTER_WIN",
      PLAYER_VOTED_OUT:"PLAYER_VOTED_OUT",
      IMPOSTER_LOSE:"IMPOSTER_LOSE"
    };
  }
  setSeed(seed){
    this.seed = seed;
  }
  createPlayer(id,name){
    let self = this;
    let player = {
      displayName:"",
      id:id
    };
    if(!self.model.varPlayers.hasOwnProperty(id)){
      self.model.varPlayers[id] = player;
    }
    player.displayName=name.replace(/\W/g, '');
    return player;
  }
  fillPlayerDetails(){
    //To be overwritten
    //client: populates only the data needed for display
    //server: populates all data
  }
  getPlayer(id){
    let self = this;
    return self.model.varPlayers[id];
  }
  getPlayerByTag(tag){
    let self = this;
    let playerKeys = Object.keys(self.model.varPlayers);
    for(let i=0;i<playerKeys.length;i+=1){
        let player = self.model.varPlayers[playerKeys[i]];
        if(player.playerTag == tag){
             return player;
        }
    }
    return {id:0,displayName:"unknown player"};//should not get here
  }
  getAllPlayers(){
    //should be used sparingly
    let self = this;
    return self.model.varPlayers;
  }
  getTask(id){
    let self = this;
    return self.model.varTasks[id];
  }
  getTasksForPlayer(playerId){
    let self = this;
    let result = [];
    let keys =Object.keys(self.model.varTasks);
    for(let i=0;i<keys.length;i+=1){
        let taskId = keys[i];
        let task = self.model.varTasks[taskId];
        if(playerId == task.owner){
          result.push(task);
        }
    }
    return result;
  }
  killPlayer(player,from){
    let self = this;
    //update player status to be "killed"
    self.model.varPlayers[player].isAlive = false;
  }
  
  join(id,playername){
    let self = this;
    self.createPlayer(id,playername);
  }
  
  start(){
    let self = this;
    let rngFunction = function(a) {
        return function() {
          a |= 0; a = a + 0x6D2B79F5 | 0;
          var t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    };
    let PRNG = rngFunction(self.seed);
    let shuffleArray = function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(PRNG() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    };
    let generateTask = function(){
        let task = {name:""};
        let names =  ["A","B","C","D","E","F","G","H"];
        task.name = names[Math.floor(PRNG()*names.length)];
        task.description = "";
        task.rewardPlayer = playerTags[Math.floor(PRNG()*playerTags.length)];
        task.isClear = false;
        task.isStarted = false;
        task.SabotageCooldown = 0;
        return task;
    };
    let keys = Object.keys(self.model.varPlayers);//NOTE: requires the keys to be randomised. (done via getRandomString() in init))
    keys.sort();//sort initially to make sure everyone has a synchronised array
    shuffleArray(keys);//shuffle it to set the imposter(s) randomly, shuffle uses a PRNG so is deterministic over all players
    
    //Assign players individual QR codes //TODO: validate there aren't more players than player QR codes
    //NOTE: this requires having as many QR codes as there are Ids in this array
    let playerTags = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"];
    playerTags = playerTags.slice(0,keys.length);//trim down the number of tags to just the number of players so that tags will always be A->[num players]
    shuffleArray(playerTags);
    for(let i=0;i<keys.length;i+=1){
        self.model.varPlayers[keys[i]].playerTag = playerTags[i];
        self.model.varPlayers[keys[i]].isAlive = true;
    }
    //set up the imposter(s)
    let imposterCount = Au.IMPOSTER_NUMBER;//TODO: validate imposterCount is less than Au.varPlayers.length
    let taskCount = Au.TASK_NUMBER;
    for(let i=0;i<imposterCount;i+=1){
        self.model.varPlayers[keys[i]].isImposter = true;
    }
    //set up the innocent(s)
    for(let i=imposterCount;i<keys.length;i+=1){
        self.model.varPlayers[keys[i]].isImposter = false;
        //generate tasks
        for(let j=0;j<taskCount;j+=1){
            let task = generateTask();
            task.owner = keys[i];
            self.model.varTasks[keys[i]+"_"+j] = task;
            task.key = keys[i]+"_"+j;
        }
    }
  }
  
  clearTask(key){
    let self = this;
    if(self.model.varTasks.hasOwnProperty(key)){
        self.model.varTasks[key].isClear = true;
    }
  }
  
  //NOTE: this does nothing server-side, since players can track this using their update event
  //this could be replicated here, using date deltas, but for now it's client-only
  sabotageEvent(evt){}
  //NOTE: nothing to do here generically, it's for client display only
  evtTagInfo(playerName,tag){}
  
  
  hostMeeting(host,kills,progress){
    let self = this;
    self.model.varVotes = [];
  }
  
  castVote(vote){
    let self = this;
    self.model.varVotes.push(vote);
  }
  
  //helper methods for vote counting
  tallyVotes(){
    let self = this;
    //tally votes
    let aliveCount = 0;//number of innocents alive
    let imposterCount = 0;//number of imposters alive
    let keys = Object.keys(self.model.varPlayers);
    let tally = {};
    for(let i=0;i<keys.length;i+=1){
        let player = self.model.varPlayers[keys[i]];
        tally[player.id] = 0;//add non-alive players to the tally, just have 0 votes
        if(player.isAlive){
            if(player.isImposter){
                imposterCount+=1;
            }else{
              aliveCount+=1;
            }
        }
    }
    tally.skip_vote = 0;//"skip_vote" is a reserved word to represent a fake player vote for skipping the round
    if(imposterCount>=aliveCount){//imposters have majority
        return {result:self.VOTE_RESULTS.IMPOSTER_WIN};
    }
    if(imposterCount==0){//no imposters are in the vote
        return {result:self.VOTE_RESULTS.IMPOSTER_LOSE};
    }
    //tally up the votes from alive players
    let maxTally = 0;  //highest number of votes for a single choice
    let totalTally = 0;//total votes cast overall
    for(let i=0;i<self.model.varVotes.length;i+=1){
        let vote = self.model.varVotes[i];
        if(self.model.varPlayers[vote.from].isAlive){
          tally[vote.name]+=1;
          totalTally+=1;
        }
    }
    let tallyKeys = Object.keys(tally);
    for(let i=0;i<tallyKeys.length;i+=1){
        if(tally[tallyKeys[i]]>maxTally){
            maxTally = tally[tallyKeys[i]];//find the highest vote
        }
    }
    let tieCount=0;
    let votedId = "";
    for(let i=0;i<tallyKeys.length;i+=1){
        if(tally[tallyKeys[i]]==maxTally){
            tieCount+=1;
            votedId = tallyKeys[i];
        }
    }
    //short circuit: votes for 1 choice are the majority
    if(tally.skip_vote>Math.ceil(aliveCount/2)){//skip was majority
        return {result:self.VOTE_RESULTS.SKIPPED,skipCount:tally.skip_vote};
    }
    if(maxTally>Math.ceil(aliveCount/2)){//playerId was a majority
        return {result:self.VOTE_RESULTS.PLAYER_VOTED_OUT,playerId:votedId};
    }
    //nothing is a clear majority, check to see if all votes are cast
    if(totalTally<aliveCount+imposterCount){//not enough votes recorded yet
        return {result:self.VOTE_RESULTS.INTERIM};
    }
    //all votes have been cast, see if there's a tie
    if(tieCount>1){
        return {result:self.VOTE_RESULTS.TIE,tieCount:tieCount};
    }
    //no tie, but skip was the leading choice
    if(votedId=="skip_vote"){
        return {result:self.VOTE_RESULTS.SKIPPED,skipCount:tally.skip_vote};
    }
    //no tie, vote out the player with the highest number of votes
    return {result:self.VOTE_RESULTS.PLAYER_VOTED_OUT,playerId:votedId};
    
  }
  gameOver(imposterwin,description){
    //this is overwritten, and is different from the client/server
  }
  voteResult(isvoteout,result,description,playerid){
    //this is overwritten, and is different from the client/server
  }
  
  
}

