
import Au from "./globals.mjs";

export default class StateTask {
  constructor() {}
  
  init(){
    let minigameTemplate = `
	<div id="dvMinigames" style="display:none;">
  
	<!--start minigames-->
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameA"
		 class="minigame">
		
		<button id="btnMinigameA1" class="btnMinigameA btn btn-info" style="position:fixed;left:100px;top:100px;width:6em;height:6em;">A</button>
		<button id="btnMinigameA2" class="btnMinigameA btn btn-info"  style="position:fixed;left:200px;top:200px;width:6em;height:6em;">B</button>
		<button id="btnMinigameA3" class="btnMinigameA btn btn-info"  style="position:fixed;left:300px;top:100px;width:6em;height:6em;">C</button>
		
	</div>
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameB"
		 class="minigame">
		<input id="iptMinigameB1"  type="range" class="form-range" min="0" max="5" step="0.5" id="customRange3" disabled="disabled" value="1">
		<input id="iptMinigameB2"  type="range" class="form-range" min="0" max="5" step="0.5" id="customRange3" value="4">
		<input id="iptMinigameB3"  type="range" class="form-range" min="0" max="5" step="0.5" id="customRange3" disabled="disabled" value="1">
	</div>
	
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameC"
		 class="minigame">
		<div class="container">
			<div class="row">
				<div class="col-3"></div>
				<div class="col-6"  style="color:white;">Code: <span id="iptMinigameC2"></span></div>
			</div>
			<div class="row">
				<div class="col-3"></div>
				<div class="col-6">
					<input type="text" id="iptMinigameC1" value="" class="form-control">
				</div>
			</div>
			
		</div>
	</div>
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameD"
		 class="minigame">
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
				<div class="form-check form-switch iptMinigameDcheck">
					<input class="form-check-input" type="checkbox" id="iptMinigameD1" >
				</div>
				<div class="form-check form-switch iptMinigameDcheck">
					<input class="form-check-input" type="checkbox" id="iptMinigameD2" checked>
				</div>
				<div class="form-check form-switch iptMinigameDcheck">
					<input class="form-check-input" type="checkbox" id="iptMinigameD3" >
				</div>
			</div>
		</div>
	</div>
	
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameE"
		 class="minigame">
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
				<h3><span  style="color:white;" id="spnMinigameE1"></span></h3>
			</div>
		</div>
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
				<button id="dvMinigameE2" class="btn btn-primary">Click</button>
			</div>
		</div>
	</div>
	
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameF"
		 class="minigame">
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
				<h3 style="color:white;" ><span   id="spnMinigameF1"></span> +
				<span  id="spnMinigameF2"></span> = </h3>
			</div>
		</div>
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
					<input type="number" id="spnMinigameF3" value="" class="form-control">
			</div>
		</div>
	</div>
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameG"
		 class="minigame">
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
				<h3 style="color:white;" ><span  id="spnMinigameG1"></span> -
				<span   id="spnMinigameG2"></span> = </h3>
			</div>
		</div>
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
					<input type="number" id="spnMinigameG3" value="" class="form-control">
			</div>
		</div>
	</div>
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameH"
		 class="minigame">
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
				<h3 style="color:white;" ><span  id="spnMinigameH1"></span> x
				<span  id="spnMinigameH2"></span> = </h3>
			</div>
		</div>
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
					<input type="number" id="spnMinigameH3" value="" class="form-control">
			</div>
		</div>
	</div>
	
	
	<!--end minigames-->
	<button id="btnCloseTask" style="display:none;position:fixed;bottom:0px;width:6em;height:6em;margin:1em;" class="btn btn-secondary" data-task="">Close</button>
	
	
	</div>`;
  $("#main").append($(minigameTemplate));
  
  
  $("#btnCloseTask").on("click",function () {
      //back out of minigame without doing changes
        Au.state = Au.states.statePlaying;
      $("#btnCloseTask").attr("data-task","");
      //clear out whatever was selected before
      Au.varLookingAtTime = 0;
  });
    
    
    
    
    
  }
  hide(){
    $("#dvMinigames").hide();
  }
  render(){
    let fontFamily = ' system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
    if(!$("#btnCloseTask").is(":visible")){
        $("#btnCloseTask").show();
    }
    if($("#lblScan").is(":visible")){
        $("#lblScan").hide();
    }
    if($("#btnAction").is(":visible")){
        $("#btnAction").hide();
    }
    if($("#dvMeeting").is(":visible")){
        $("#dvMeeting").hide();
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


