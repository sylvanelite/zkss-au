

//default data store is in-self.memory
export default class ServerDataStore {
  constructor(mem) {
    this.mem = mem;
  }
  async getState (area){
    let self = this;
      let res = [];
      res.push (self.mem["zkss_"+area]);
      return {
        rows:res
      };
  }
  async saveState (area,state){
    let self = this;
    self.mem["zkss_"+area]={
      name:"zkss_"+area,
      content:JSON.stringify(state)
      };
    }
  async resetState () {
    let self = this;
    let keys = Object.keys(self.mem);
    for(let i=0;i<keys.length;i+=1){
      if(keys[i].indexOf("zkss_")!=-1){
        self.mem[keys[i]]=[];
      }
    }
  }
  async resetMessages (){
    let self = this;
      let keys = Object.keys(self.mem);
      for(let i=0;i<keys.length;i+=1){
        if(keys[i].indexOf("zkss_")==-1){
          self.mem[keys[i]]=[];
        }
      }
  }
  async saveMessage (message,area,playerId){
    let self = this;
      if(!self.mem.hasOwnProperty(area)){
        self.mem[area]=[];
      }
      let id = self.mem[area].length+1;
      self.mem[area].push({
        id:id,
        message:message,
        area:area,
        pid:playerId
      });
    }
  async getMessages (id,area){
    let self = this;
      if(!self.mem.hasOwnProperty(area)){
        self.mem[area]=[];
      }
      let res = [];
      let memData = self.mem[area];
      for(let i=0;i<memData.length;i+=1){
        let memDataRow = memData[i];
        if(memDataRow.id>id){
          res.push(memDataRow);
        }
      }
        return {
          rows:res
        };
        
    }
  //only used if SQL 
  async connect(){}
  async end(){}
}


