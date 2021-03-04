
//this is a class representing the true game state.
//it is used on both the server and the client.
//interaction with the model should only be done via a middleware layer
//middleware will differ between client/server
export default  class Model {
  constructor() {
    this.varPlayers={};//list of player objects, stored by IDs
    this.varTasks={};//list of tasks for every player, in the form playerId_idx
    this.varVotes=[];//count of global votes cast during a meeting
    this.varProgress = 0;//0-1 percentage of tasks complete
  }
    
}

