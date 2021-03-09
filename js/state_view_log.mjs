
import Au from "./globals.mjs";

export default class StateViewLog {
  constructor() {
    this.varLogMessages = [];//buffer for viewing logs
    
  }
  
  init(){
    let logTemplate = `
	<div id="dvViewLog" style="display:none;">
  
	<button id="btnCloseLogs" style="position:fixed;bottom:0px;width:6em;height:6em;margin:1em;" class="btn btn-secondary" >Close</button>
	
	</div>`;
  $("#main").append($(logTemplate));
  
  $("#btnCloseLogs").on("click",function () {
      //back out of minigame without doing changes
        Au.state = Au.states.statePlaying;
      //clear out whatever was selected before
      Au.states.stateViewLog.varLogMessages = [];
  });
  }
  render(){
    let self = this;
    let fontFamily = ' system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
    if(!$("#dvViewLog").is(":visible")){
        $("#dvViewLog").show();
    }
    if(!$("#btnCloseLogs").is(":visible")){
        $("#btnCloseLogs").show();
    }
    if(!$("#dvPlayingUI").is(":visible")){
        $("#dvPlayingUI").show();
    }
    let ctx = Au.canvas.getContext("2d");
    ctx.clearRect(0,0,Au.canvas.width,Au.canvas.height);
    //draw header
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16pt "+fontFamily;
    let logY = 48;
    ctx.fillText("Viewing logs: ",  10.5,28.5);
    //draw messages
    for(let i=0;i<self.varLogMessages.length;i+=1){
        let text = self.varLogMessages[i];
        ctx.fillText(text, 10+0.5, logY+0.5);
        logY+=24;
    }
  }
  hide(){
    $("#dvViewLog").hide();
  }
  update(){
  //no-op for log
  }
  
}


