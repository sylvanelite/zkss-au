
import Au from "./globals.mjs";
import MinigameA from "./minigame_a.mjs";
import MinigameB from "./minigame_b.mjs";
import MinigameC from "./minigame_c.mjs";
import MinigameD from "./minigame_d.mjs";
import MinigameE from "./minigame_e.mjs";
import MinigameF from "./minigame_f.mjs";
import MinigameG from "./minigame_g.mjs";
import MinigameH from "./minigame_h.mjs";

export default class StateTask {
  constructor() {}
  
  init(){
    let minigameTemplate = `
	<div id="dvMinigames" style="display:none;">
  
	<!-- minigames are inserted here-->
  
	<button id="btnCloseTask" style="position:fixed;bottom:0px;width:6em;height:6em;margin:1em;" class="btn btn-secondary" data-task="">Close</button>
	
	</div>`;
  $("#main").append($(minigameTemplate));
  
  
  $("#btnCloseTask").on("click",function () {
      //back out of minigame without doing changes
        Au.state = Au.states.statePlaying;
      $("#btnCloseTask").attr("data-task","");
      //clear out whatever was selected before
      Au.varLookingAtTime = 0;
  });
    this.minigames = [
      new MinigameA(),
      new MinigameB(),
      new MinigameC(),
      new MinigameD(),
      new MinigameE(),
      new MinigameF(),
      new MinigameG(),
      new MinigameH()
    ];
    for(let i=0;i<this.minigames.length;i+=1){
      this.minigames[i].init();
    }
    
  }
  hide(){
    $("#dvMinigames").hide();
  }
  render(){
    if(!$("#dvMinigames").is(":visible")){
      $("#dvMinigames").show();
    }
    if(!$("#dvPlaying").is(":visible")){
      $("#dvPlaying").show();
    }
    let fontFamily = ' system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
    if(!$("#btnCloseTask").is(":visible")){
        $("#btnCloseTask").show();
    }
    let ctx = Au.canvas.getContext("2d");
    ctx.clearRect(0,0,Au.canvas.width,Au.canvas.height);
    let taskKey = $("#btnCloseTask").attr("data-task");
    let task = Au.varTasks[taskKey];
    if(!task.isStarted &&
       !$("#dvMinigame"+task.name).is(":visible")){
        //show the minigame
        $("#dvMinigame"+task.name).show();
        Au.resetMinigames();
    }
    let rewardPlayer = Au.varPlayers[Au.varPlayerId];
    let playerKeys = Object.keys(Au.varPlayers);
    for(let i=0;i<playerKeys.length;i+=1){
        let player = Au.varPlayers[playerKeys[i]];
        if(player.playerTag == task.rewardPlayer){
            rewardPlayer = player;
        }
    }
    ctx.font = "16pt "+fontFamily;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Task has been started.", 32.5, 32.5);
    ctx.fillText("Scan player: "+rewardPlayer.displayName+" to clear.",32.5,48.5);

  }
  update(){
    let taskKey = $("#btnCloseTask").attr("data-task");
    if(!taskKey.length){
        alert("no task!");//should not get here
    }
    let task = Au.varTasks[taskKey];
    if($("#dvMinigame"+task.name).length==0){//if there's no minigame, mark it as clear immediately.
        task.isStarted = true;
        console.log("skipping task: ",task);
    }
  }
  
}


