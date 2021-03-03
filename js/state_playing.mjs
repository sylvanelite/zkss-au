
import Au from "./globals.mjs";

export default class StatePlaying {
  constructor() {}
  
  init(){
    let playingTemplate = `
	<div id="dvPlaying">
		<!--TODO: UI here-->
		<label style="width:6em;height:6em;margin:1em;position:fixed;bottom:0px;line-height:4.5em;" class="btn btn-secondary align-middle" id="lblScan">
			Scan
			<input type="file" id="iptImgFile"style="display:none;"  capture="capture" >
		</label>
		<button id="btnAction" style="position:fixed;bottom:0px;right:0px;width:6em;height:6em;margin:1em;display:none;" class="btn btn-secondary"  data-action="">--</button>
	</div>`;
  $("#main").append($(playingTemplate));
  $("#btnAction").on("click",function(){
      Au.doAction(Au.varCurrentTask,Au.varCurrentTaskId);
  });
  $("#iptImgFile").on("change",function(){
      Au.scanFromFile();
  });
    
  }
  render(){
    let fontFamily = ' system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
        if($("#dvMainMenu").is(":visible")){
            $("#dvMainMenu").hide();
        }
        if($("#dvLobby").is(":visible")){
            $("#dvLobby").hide();
        }
        if($("#btnCloseTask").is(":visible")){
            $("#btnCloseTask").hide();
        }
        
        if(!$("#dvPlaying").is(":visible")){
            $("#dvPlaying").show();
        }
        if(!$("#lblScan").is(":visible")){
            $("#lblScan").show();
        }
        if($("#dvMeeting").is(":visible")){
            $("#dvMeeting").hide();
        }
        $(".minigame").hide();
        if(!Au.hasOwnProperty("canvas")){
            Au.canvas = document.createElement("canvas");
            Au.canvas.width = window.innerWidth;
            Au.canvas.height = window.innerHeight;
            Au.canvas.style.position="absolute";
            Au.canvas.style.left="0px";
            Au.canvas.style.top="0px";
            Au.canvas.style.zIndex="-1";
            $("#dvPlaying").prepend(Au.canvas);
        }
        let ctx = Au.canvas.getContext("2d");
        ctx.clearRect(0,0,Au.canvas.width,Au.canvas.height);
        //--draw the background map
        let map = document.getElementById("map");
        ctx.drawImage(map,Au.canvas.width-Au.MAP_RENDER_SIZE,0,Au.MAP_RENDER_SIZE,Au.MAP_RENDER_SIZE);
        
        
        //--draw tasks
        let keys =Object.keys(Au.varTasks);
        ctx.font = "16pt "+fontFamily;
        let taskY = 48;
        for(let i=0;i<keys.length;i+=1){
            let taskId = keys[i];
            let playerId = taskId.split("_")[0];
            let task =  Au.varTasks[taskId];
            if(playerId==Au.varPlayerId){
                let text = "Task: "+task.name+" "+task.description;
                let rewardPlayer = Au.varPlayers[Au.varPlayerId];
                let playerKeys = Object.keys(Au.varPlayers);
                for(let i=0;i<playerKeys.length;i+=1){
                    let player = Au.varPlayers[playerKeys[i]];
                    if(player.playerTag == task.rewardPlayer){
                        rewardPlayer = player;
                    }
                }
                ctx.fillStyle = "#FFFFFF";
                if(!Au.varPlayers[Au.varPlayerId].isAlive){
                    ctx.fillStyle = "#873333";//red text to indicate you've been killed
                }
                if(task.isStarted){
                    ctx.fillStyle = "#cccc00";
                    text +=" ("+rewardPlayer.playerTag+" "+rewardPlayer.displayName+")";
                }
                if(task.isClear){
                    ctx.fillStyle = "#338833";
                    if(!Au.varPlayers[Au.varPlayerId].isAlive){
                        ctx.fillStyle = "#843281";//pruple text to indicate you've been killed
                    }
                }
                ctx.fillText(text, 10+0.5, taskY+0.5);
                taskY+=24;
            }
        }
        //--draw fake tasks
        if(Au.varPlayers[Au.varPlayerId].isImposter ){
            if(Au.varFakeTasks.length==0){
                let generateFakeTask = function(){
                    let task = {name:""};
                    let names =  ["A","B","C","D","E","F","G","H"];
                    task.name = names[Math.floor(Au.PRNG()*names.length)];
                    task.description= "";
                    return task;
                };
                for(let i=0;i<Au.TASK_NUMBER;i+=1){
                    Au.varFakeTasks.push(generateFakeTask());
                }
            }
            for(let i=0;i<Au.varFakeTasks.length;i+=1){
                let text = "Fake: "+Au.varFakeTasks[i].name+" "+Au.varFakeTasks[i].description;
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(text, 10+0.5, taskY+0.5);
                taskY+=24;
            }
        }
        //draw your name/status
        if(Au.varPlayers[Au.varPlayerId].isImposter){
            ctx.fillStyle = "#883333";
        }else{
            ctx.fillStyle = "#338833"; 
        }
        ctx.font = '16pt '+fontFamily;
        ctx.fillText(Au.varPlayers[Au.varPlayerId].playerTag+": "+Au.varPlayers[Au.varPlayerId].displayName,  10.5,28.5);
        //draw timer behind the action button
        if(Au.varCurrentTask.length>0 && Au.varLookingAtTime>0){
            let btnWidth = $("#btnAction").width()+48;
            let btnX = $("#btnAction").position().left;
            let btnY = $("#btnAction").position().top;
            
            let scale = Au.varLookingAtTime/Au.TIME_LOOK_AT;
            
            ctx.fillStyle = "#000000";
            ctx.fillRect(btnX, btnY-8, (btnWidth), 8);
            ctx.fillStyle = "#333333";
            ctx.fillRect(btnX, btnY-8, (btnWidth)*scale, 8);
        }
        
        if($("#btnAction").attr("data-action")!=Au.varCurrentTask){
            $("#btnAction").attr("data-action",Au.varCurrentTask);
            if(Au.varCurrentTask.length>0){
                $("#btnAction").text(Au.varCurrentTask);
                $("#btnAction").show();
            }else{
                $("#btnAction").text("--");
                $("#btnAction").hide();
            }
        }
    
  }
  hide(){
    $("#dvPlaying").hide();
  }
  update(){
    //read QR events
    
    //the camera has lost the QR code for more than a certain timeframe, clear the action
    if( Au.varLookingAtTime>0){
         Au.varLookingAtTime -= 15;
    }else{
        Au.varLookingAtTime = 0;
        Au.varLookingAtQr = "";
    }
    if( Au.varMeetingCooldown>0){
         Au.varMeetingCooldown -= 15;
    }else{
        Au.varMeetingCooldown = 0;
    }
    if( Au.varKillCooldown>0){
         Au.varKillCooldown -= 15;
    }else{
        Au.varKillCooldown = 0;
    }
    //update your sabotaged cooldowns
    let keys = Object.keys(Au.varTasks);
    for(let i=0;i<keys.length;i+=1){
        let task = Au.varTasks[keys[i]];
        if(task.owner == Au.varPlayerId){
            if(task.SabotageCooldown>0){
                task.SabotageCooldown -= 15;
           }else{
               task.SabotageCooldown=0;
           }
        }
    }
    //QR codes have the values:
    // player_[ID]
    // task_[TD]
    let qr = Au.varLookingAtQr;
    Au.varCurrentTask = "";
    Au.varCurrentTaskId = "";
    
    let qrKind = "";
    let qrId = "";
    if(qr.length){
        qrKind = qr.split("_")[0];
        qrId =  qr.split("_")[1];
    }else{
        return;//nothing in target, skip doing anything
    }
    let isImposter = Au.varPlayers[Au.varPlayerId].isImposter;
    if(isImposter){
        if(qrKind == "player"){
            Au.varCurrentTask = Au.TASKS.KILL;
            Au.varCurrentTaskId = qrId;
        }
        if(qrKind == "task"){
            Au.varCurrentTask = Au.TASKS.SABOTAGE;
            Au.varCurrentTaskId = qrId;
        }
    }
    if(!isImposter){
        if(qrKind == "task"){
            Au.varCurrentTask = Au.TASKS.TASK;
            Au.varCurrentTaskId = qrId;
        }
        if(qrKind == "player"){
            Au.varCurrentTask = Au.TASKS.INTERACT;
            Au.varCurrentTaskId = qrId;
        }
    }
    //anyone can call the meeting
    if(qrKind == "meeting"){
        Au.varCurrentTask = Au.TASKS.MEETING;
        Au.varCurrentTaskId = "";
    }
    //anyone can view logs
    if(qrKind == "log"){
        Au.varCurrentTask = Au.TASKS.VIEW_LOG;
        Au.varCurrentTaskId = "";
    }
  }
  
}


