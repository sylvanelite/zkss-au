
import Au from "./globals.mjs";

export default class StateViewLog {
  constructor() {
    this.varLogMessages = [];//buffer for viewing logs
    
  }
  
  init(){
    //nothing to do, but it dies require the canvas to be displayed
  }
  render(){
    let self = this;
    let fontFamily = ' system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
    
    if(!$("#btnCloseTask").is(":visible")){
        $("#btnCloseTask").show();
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
  hide(){}
  update(){
  //no-op for log
  }
  
}


