
import Au from "./globals.mjs";

export default class StatePlaying {
  constructor() {
    //timers: counts down 15ms per game tick, refreshed every game loop (note alerts might block this)
    this.varLookingAtTime = 0;
    this.varMeetingCooldown = 0;
    this.varKillCooldown = 0;
    //populated with whatever QR code is currently being looked at
    this.varLookingAtQr = Au.TIME_LOOK_AT;
    
    
    this.varFakeTasks = [];//if you're the imposter, these are generated just for rendering
  }
  
  init(){
    let self = this;
    
    self.varCurrentTask="";      //when clicking  "do", this is populated with whatever you're looking at
    self.varCurrentTaskId="";    //an additional param extracted from the QR code
    
    
    let playingTemplate = `
	<div id="dvPlaying">
    <div id="dvPlayingCanvas">
    </div>
    <div id="dvPlayingUI">
      <!--TODO: UI here-->
      <label style="width:6em;height:6em;margin:1em;position:fixed;bottom:0px;line-height:4.5em;" class="btn btn-secondary align-middle" id="lblScan">
        Scan
        <input type="file" id="iptImgFile"style="display:none;"  capture="capture" >
      </label>
      <button id="btnAction" style="position:fixed;bottom:0px;right:0px;width:6em;height:6em;margin:1em;display:none;" class="btn btn-secondary"  data-action="">--</button>
    </div>
  </div>`;
  $("#main").append($(playingTemplate));
  $("#btnAction").on("click",function(){
     self.doAction(self.varCurrentTask,self.varCurrentTaskId);
  });
  $("#iptImgFile").on("change",function(){
      Au.scanFromFile();
  });
    
  }
  render(){
    let self = this;
    let selfPlayer = Au.middleware.getPlayer(Au.varPlayerId);
    let fontFamily = ' system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
        if(!$("#dvPlaying").is(":visible")){
            $("#dvPlaying").show();
        }
        if(!$("#dvPlayingUI").is(":visible")){
            $("#dvPlayingUI").show();
        }
        if(!$("#dvPlayingCanvas").is(":visible")){
            $("#dvPlayingCanvas").show();
        }
        
        if(!$("#lblScan").is(":visible")){
            $("#lblScan").show();
        }
        if(!Au.hasOwnProperty("canvas")){
            Au.canvas = document.createElement("canvas");
            Au.canvas.width = window.innerWidth;
            Au.canvas.height = window.innerHeight;
            Au.canvas.style.position="absolute";
            Au.canvas.style.left="0px";
            Au.canvas.style.top="0px";
            Au.canvas.style.zIndex="-1";
            $("#dvPlayingCanvas").append(Au.canvas);
        }
        let ctx = Au.canvas.getContext("2d");
        ctx.clearRect(0,0,Au.canvas.width,Au.canvas.height);
        //--draw the background map
        let map = document.getElementById("map");
        ctx.drawImage(map,Au.canvas.width-Au.MAP_RENDER_SIZE,0,Au.MAP_RENDER_SIZE,Au.MAP_RENDER_SIZE);
        
        
        //--draw tasks
        ctx.font = "16pt "+fontFamily;
        let taskY = 48;
        let tasks = Au.middleware.getTasksForPlayer(Au.varPlayerId);
        for(let i=0;i<tasks.length;i+=1){
            let task = tasks[i];
            let text = "Task: "+task.name+" "+task.description;
            let rewardPlayer = Au.middleware.getPlayerByTag( task.rewardPlayer);
            ctx.fillStyle = "#FFFFFF";
            if(!selfPlayer.isAlive){
                ctx.fillStyle = "#873333";//red text to indicate you've been killed
            }
            if(task.isStarted){
                ctx.fillStyle = "#cccc00";
                text +=" ("+rewardPlayer.playerTag+" "+rewardPlayer.displayName+")";
            }
            if(task.isClear){
                ctx.fillStyle = "#338833";
                if(!selfPlayer.isAlive){
                    ctx.fillStyle = "#843281";//pruple text to indicate you've been killed
                }
            }
            ctx.fillText(text, 10+0.5, taskY+0.5);
            taskY+=24;
        }
        //--draw fake tasks
        if(selfPlayer.isImposter ){
            if(self.varFakeTasks.length==0){
                let generateFakeTask = function(){
                    let task = {name:""};
                    let names =  ["A","B","C","D","E","F","G","H"];
                    task.name = names[Math.floor(Math.random()*names.length)];
                    task.description= "";
                    return task;
                };
                for(let i=0;i<Au.TASK_NUMBER;i+=1){
                    self.varFakeTasks.push(generateFakeTask());
                }
            }
            for(let i=0;i<self.varFakeTasks.length;i+=1){
                let text = "Fake: "+self.varFakeTasks[i].name+" "+self.varFakeTasks[i].description;
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(text, 10+0.5, taskY+0.5);
                taskY+=24;
            }
        }
        //draw your name/status
        if(selfPlayer.isImposter){
            ctx.fillStyle = "#883333";
        }else{
            ctx.fillStyle = "#338833"; 
        }
        ctx.font = '16pt '+fontFamily;
        ctx.fillText(selfPlayer.playerTag+": "+selfPlayer.displayName,  10.5,28.5);
        //draw timer behind the action button
        if(self.varCurrentTask.length>0 && self.varLookingAtTime>0){
            let btnWidth = $("#btnAction").width()+48;
            let btnX = $("#btnAction").position().left;
            let btnY = $("#btnAction").position().top;
            
            let scale = self.varLookingAtTime/Au.TIME_LOOK_AT;
            
            ctx.fillStyle = "#000000";
            ctx.fillRect(btnX, btnY-8, (btnWidth), 8);
            ctx.fillStyle = "#333333";
            ctx.fillRect(btnX, btnY-8, (btnWidth)*scale, 8);
        }
        
        if($("#btnAction").attr("data-action")!=self.varCurrentTask){
            $("#btnAction").attr("data-action",self.varCurrentTask);
            if(self.varCurrentTask.length>0){
                $("#btnAction").text(self.varCurrentTask);
                $("#btnAction").show();
            }else{
                $("#btnAction").text("--");
                $("#btnAction").hide();
            }
        }
    
  }
  hide(){
    $("#dvPlayingUI").hide();
  }
  update(){
    let self=this;
    let selfPlayer = Au.middleware.getPlayer(Au.varPlayerId);
    //read QR events
    
    //the camera has lost the QR code for more than a certain timeframe, clear the action
    if( self.varLookingAtTime>0){
         self.varLookingAtTime -= 15;
    }else{
        self.varLookingAtTime = 0;
        self.varLookingAtQr = "";
    }
    if( self.varMeetingCooldown>0){
         self.varMeetingCooldown -= 15;
    }else{
        self.varMeetingCooldown = 0;
    }
    if( self.varKillCooldown>0){
         self.varKillCooldown -= 15;
    }else{
        self.varKillCooldown = 0;
    }
    //update your sabotaged cooldowns
    let tasks = Au.middleware.getTasksForPlayer(Au.varPlayerId);
    for(let i=0;i<tasks.length;i+=1){
        let task = tasks[i];
        if(task.SabotageCooldown>0){
            task.SabotageCooldown -= 15;
       }else{
           task.SabotageCooldown=0;
       }
    }
    //QR codes have the values:
    // player_[ID]
    // task_[TD]
    let qr = self.varLookingAtQr;
    self.varCurrentTask = "";
    self.varCurrentTaskId = "";
    
    let qrKind = "";
    let qrId = "";
    if(qr.length){
        qrKind = qr.split("_")[0];
        qrId =  qr.split("_")[1];
    }else{
        return;//nothing in target, skip doing anything
    }
    let isImposter = selfPlayer.isImposter;
    if(isImposter){
        if(qrKind == "player"){
            self.varCurrentTask = Au.TASKS.KILL;
            self.varCurrentTaskId = qrId;
        }
        if(qrKind == "task"){
            self.varCurrentTask = Au.TASKS.SABOTAGE;
            self.varCurrentTaskId = qrId;
        }
    }
    if(!isImposter){
        if(qrKind == "task"){
            self.varCurrentTask = Au.TASKS.TASK;
            self.varCurrentTaskId = qrId;
        }
        if(qrKind == "player"){
            self.varCurrentTask = Au.TASKS.INTERACT;
            self.varCurrentTaskId = qrId;
        }
    }
    //anyone can call the meeting
    if(qrKind == "meeting"){
        self.varCurrentTask = Au.TASKS.MEETING;
        self.varCurrentTaskId = "";
    }
    //anyone can view logs
    if(qrKind == "log"){
        self.varCurrentTask = Au.TASKS.VIEW_LOG;
        self.varCurrentTaskId = "";
    }
  }
  
  
  
  doAction (task,qrId){
    let self = this;
    let selfPlayer = Au.middleware.getPlayer(Au.varPlayerId);
    if(task == Au.TASKS.KILL){
        if(self.varKillCooldown<=0){
            let targetPlayer = Au.middleware.getPlayerByTag(qrId);
            if(targetPlayer.isImposter){
                alert("Target is an imposter.");
                return;
            }
            if(!targetPlayer.id){
                alert("Could not find player");
                return;
            }
            Au.sendMessage(JSON.stringify({
                kind:Au.EVENTS.KILL,
                name:targetPlayer.id,
                from:Au.varPlayerId,
            }));
            self.varKillCooldown=Au.TIME_BETWEEN_KILL;
        }else{
            alert("Cannot kill yet, need to wait:"+(Math.floor(self.varKillCooldown/1000))+" seconds.");
        }
        return;
    }
    if(task == Au.TASKS.SABOTAGE){
        Au.sendMessage(JSON.stringify({
            kind:Au.EVENTS.SABOTAGE,
            event:qrId
        }));
        return;
    }
    if(task == Au.TASKS.TASK){
        //check if you've scanned a tag, if so, see if it's one of your tasks and begin the minigame
        let tasks = Au.middleware.getTasksForPlayer(Au.varPlayerId);
        for(let i=0;i<tasks.length;i+=1){
            let task = tasks[i];
            //this is a task, see if it's something you're assigned with
            if(task.name == qrId && !task.isStarted){
                if(task.SabotageCooldown>0){
                    alert("task is sabotaged, wait: "+Math.floor(task.SabotageCooldown/1000)+" seconds");
                    return;
                }
                //yes, it's something you can do: TODO: create more minigames
                $("#btnCloseTask").attr("data-task",task.key);
                Au.state = Au.states.stateTask;
                return;//only do 1 task at a time, even if multiple have the same tag
            }
        }
        //else, if you got here, this minigame isn't one of yours
        alert("You don't have to do this task");
        return;
    }
    if(task == Au.TASKS.INTERACT){
        //check if a task you've done can be handed in to a player
        let tasks = Au.middleware.getTasksForPlayer(Au.varPlayerId);
        for(let i=0;i<tasks.length;i+=1){
            let task = tasks[i];
              if(task.isStarted && task.rewardPlayer == qrId){
                  //task complete
                    Au.sendMessage(JSON.stringify({
                          kind:Au.EVENTS.CLEAR_TASK,
                          key:task.key
                      }));
                    return;
              }
        }
        
        //else, if you got here it's not a task for you, so instead show the player status
        let rewardPlayer = Au.middleware.getPlayerByTag(qrId);
        if(rewardPlayer.isAlive){
            alert(rewardPlayer.displayName+" is alive");
        }else{
            //can report a dead body as long as you're alive, no meeting cooldown needed (varMeetingCooldown)
            if(!selfPlayer.isAlive){
                alert(rewardPlayer.displayName+" is dead!\n You're dead too, can't report");
                return;
            }
            let report = confirm(rewardPlayer.displayName+" is dead!\n call meeting?");
            if(report){
                Au.sendMessage(JSON.stringify({
                      kind:Au.EVENTS.MEETING,
                      host:Au.varPlayerId
                  }));
            }
        }
        
    }
    if(task == Au.TASKS.MEETING){
        if(!selfPlayer.isAlive){
            alert("can't call meeting, you're dead.");
            return;
        }
        if(self.varMeetingCooldown<=0){
            let doMeeting = confirm("Call meeting?");
            if(doMeeting){
                Au.sendMessage(JSON.stringify({
                      kind:Au.EVENTS.MEETING,
                      host:Au.varPlayerId
                  }));
            }
        }else{
            alert("Cannot call meeting yet, need to wait:"+(Math.floor(self.varMeetingCooldown/1000))+" seconds.");
        }
    }
    if(task == Au.TASKS.VIEW_LOG){
        Au.states.stateViewLog.varLogMessages = [];
        Au.state = Au.states.stateViewLog;
    }
    
  }
  
  
}


