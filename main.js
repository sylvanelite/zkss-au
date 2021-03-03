//to run with CGI: python -m http.server --bind localhost --cgi 8000
//https://stackoverflow.com/questions/4139170/bind-httserver-to-local-ipport-so-that-others-in-lan-can-see-it
//      python -m http.server 8888 --bind 0.0.0.0 --cgi - then view on <ip>:8888


import Au from "./js/globals.mjs";
import StateLobby from "./js/state_lobby.mjs";
import StateMainMenu from "./js/state_main_menu.mjs";
import StateMeeting from "./js/state_meeting.mjs";
import StatePlaying from "./js/state_playing.mjs";
import StateTask from "./js/state_task.mjs";
import StateViewLog from "./js/state_view_log.mjs";

//entry point, assign ID and initial state
Au.init = function(){
    //assign a playerId
    Au.varPlayerId = Au.getRandomString(50);
    Au.varPlayers[Au.varPlayerId] = {displayName:"",id:Au.varPlayerId};//TODO: create player objects
    
    //main menu
    Au.states = {};
    Au.states.stateLobby = new StateLobby();
    Au.states.stateMainMenu = new StateMainMenu();
    Au.states.stateMeeting = new StateMeeting();
    Au.states.statePlaying = new StatePlaying();
    Au.states.stateTask = new StateTask();
    Au.states.stateViewLog = new StateViewLog();
    
    for (const state of Object.values(Au.states)) {
      state.init();
      state.hide();
    }

    Au.state = Au.states.stateMainMenu;
    console.log(Au);
    
    //starts the main loops running
    Au.renderLoop();
    
    $(window).on("resize",function(){
        if(Au.hasOwnProperty("canvas")){
            Au.canvas.width = window.innerWidth;
            Au.canvas.height = window.innerHeight;
        }
    });
};
//game logic, called on main thread
Au.mainLoop = function () {
    Au.logic();
    Au.loopId = window.setTimeout(Au.mainLoop, 15);
};
//animation frame 
Au.renderLoop = function() {
    Au.render();
    Au.animationId = window.requestAnimationFrame(Au.renderLoop);
};
//main logic processing
Au.logic = function(){
    //poll server for new events
    Au.getMessageTimer-=15;
    if(Au.getMessageTimer<=0){
        Au.getMessageTimer = Au.varMessagePollTime;
        Au.getMessage();
    }
    //read from buffer and handle events
    for(let i=0;i<Au.varMessageBuffer.length;i+=1){
        Au.processEvent(Au.varMessageBuffer[i]);
    }
    Au.varMessageBuffer = [];
    Au.state.update();
    
};
//main rendering
Au.render = function(){
    Au.state.render();
};

//message should be a json string, processed by: JSON.stringify()
Au.sendMessage = function(jsonString){
    let data = {
        kind:"send",
        area:Au.varArea,
        message:jsonString
    };
    console.log("sending: ",jsonString);
    $.ajax({
        url:Au.BASE_URL,
        data:data,
        method:"POST",
        dataType:"JSON"
    });
};
//fires periodically while the main loop is running
//pushes raw messges (strings) into the event queue and updates the message id
//messageId can be used for debugging, but will usually be the most recent message id recieved
Au.getMessage = function(messageId){
    if(!messageId){
        messageId = Au.varMessageId;
    }
    let data = {
        kind:"get",
        area:Au.varArea,
        id:messageId
    };
    $.ajax({
        url:Au.BASE_URL,
        data:data,
        method:"POST",
        dataType:"JSON"
    }).done(function(e){
        if(e.data.length>0){
            for(let i=0;i<e.data.length;i+=1){
                let message = e.data[i];
                Au.varMessageBuffer.push(message.message);
                if(message.id>Au.varMessageId){
                    Au.varMessageId = message.id;
                }
            }
        }
    });
    
};

//Used to forcibly reset the DB (wipe all data)
Au.resetServer = function(){
    let data = {
        kind:"reset"
    };
    $.ajax({
        url:Au.BASE_URL,
        data:data,
        method:"POST",
        dataType:"JSON"
    }).done(function(e){
        console.log("reset done",e);
    });
    
    
};


//handle events recieved over the wire (and locally...)
Au.processEvent = function(evt){
    let json = JSON.parse(evt);
    console.log("got event:",json.kind,json);
    switch(json.kind){
        case Au.EVENTS.JOIN:
            Au.evtJoin(json);
            break;
        case Au.EVENTS.START:
            Au.evtStart(json);
            break;
        case Au.EVENTS.CLEAR_TASK:
            Au.evtClearTask(json);
            break;
        case Au.EVENTS.KILL:
            Au.evtKill(json);
            break;
        case Au.EVENTS.MEETING:
            Au.evtMeeting(json);
            break;
        case Au.EVENTS.SABOTAGE:
            Au.evtSabotage(json);
            break;
        case Au.EVENTS.VOTE:
            Au.evtVote(json);
            break;
        case Au.EVENTS.TAG_INFO:
            Au.evtTagInfo(json);
            break;
    }
};


//Events recieved over the wire (including from self)

//join [playername,id]
//push into obj of players
Au.evtJoin = function(json){
    let playername = json.playername;
    let id = json.id;
    if(!Au.varPlayers.hasOwnProperty(id)){//should only exist if it's yourself
        Au.varPlayers[id] = {displayName:playername,id:id};
        $("#dvCurrentPlayers").attr("data-needsRefresh",true);
    }
};

//start [seed]
Au.evtStart = function(json){
    let seed = json.seed;
    //use the seed to set up who's what role & tasks
    //https://github.com/bryc/code/blob/master/jshash/PRNGs.md
    //Mulberry32 - License: Public domain.
    let rngFunction = function(a) {
        return function() {
          a |= 0; a = a + 0x6D2B79F5 | 0;
          var t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    };
    Au.PRNG = rngFunction(seed);
    let shuffleArray = function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Au.PRNG() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    };
    let generateTask = function(){
        let task = {name:""};
        let names =  ["A","B","C","D","E","F","G","H"];
        task.name = names[Math.floor(Au.PRNG()*names.length)];
        task.description = "";
        task.rewardPlayer = playerTags[Math.floor(Au.PRNG()*playerTags.length)];
        task.isClear = false;
        task.isStarted = false;
        task.SabotageCooldown = 0;
        return task;
    };
    let keys = Object.keys(Au.varPlayers);
    keys.sort();//sort initially to make sure everyone has a synchronised array
    shuffleArray(keys);//shuffle it to set the imposter(s) randomly, shuffle uses a PRNG so is deterministic over all players
    
    //Assign players individual QR codes //TODO: validate there aren't more players than player QR codes
    //NOTE: this requires having as many QR codes as there are Ids in this array
    let playerTags = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"];
    playerTags = playerTags.slice(0,keys.length);//trim down the number of tags to just the number of players so that tags will always be A->[num players]
    shuffleArray(playerTags);
    for(let i=0;i<keys.length;i+=1){
        Au.varPlayers[keys[i]].playerTag = playerTags[i];
        Au.varPlayers[keys[i]].isAlive = true;
    }
    //set up the imposter(s)
    let imposterCount = Au.IMPOSTER_NUMBER;//TODO: validate imposterCount is less than Au.varPlayers.length
    let taskCount = Au.TASK_NUMBER;
    for(let i=0;i<imposterCount;i+=1){
        Au.varPlayers[keys[i]].isImposter = true;
        console.log(keys[i],"is imposter");
    }
    //set up the innocent(s)
    for(let i=imposterCount;i<keys.length;i+=1){
        Au.varPlayers[keys[i]].isImposter = false;
        //generate tasks
        for(let j=0;j<taskCount;j+=1){
            let task = generateTask();
            task.owner = keys[i];
            Au.varTasks[keys[i]+"_"+j] = task;
        }
    }
    Au.state = Au.states.statePlaying;
    let txt = ".";
    if( Au.varPlayers[Au.varPlayerId].isImposter){
        txt = "\nYou are the imposter.";
        //TODO: show other imposters
    }
    alert("Your player tag is: "+ Au.varPlayers[Au.varPlayerId].playerTag + txt);
};

//json = {key}
//update Au.task[key] = clear (if all clear == win)
Au.evtClearTask = function(json){
    let key = json.key;
    if(Au.varTasks.hasOwnProperty(key)){
        Au.varTasks[key].isClear = true;
    }
    //check all tasks are clear, if so, end game
    let allClear = true;
    let keys = Object.keys(Au.varTasks);
    for(let i=0;i<keys.length;i+=1){
        let task = Au.varTasks[keys[i]];
        if(!task.isClear){
            allClear = false;
            break;
        }
    }
    if(allClear){
        alert("Innocents win! All tasks clear!");//TODO: better win/loss mechanic (reveal imposter, etc)
    }
    
};
//kill [name,from]
//--if(name == self) {kill}
Au.evtKill = function(json){
    let player = json.name;
    let from = json.from;
    if(player == Au.varPlayerId){
        console.log("you have been killed by: "+from);
        alert("you were killed by: "+Au.varPlayers[from].displayName);
    }
    if(from == Au.varPlayerId){
        console.log("you have killed: "+player);
        alert("you have killed: "+Au.varPlayers[player].displayName);
    }
    //update player status to be "killed"
    Au.varPlayers[player].isAlive = false;
    //check number of alive
    let aliveCount = 0;
    let imposterCount = 0;
    let keys = Object.keys(Au.varPlayers);
    for(let i=0;i<keys.length;i+=1){
        let player = Au.varPlayers[keys[i]];
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
};
//meeting [host]
//--cancel tasks, show vote
Au.evtMeeting = function(json){
    Au.varMeetingHost = json.host;
    Au.varVotes = [];
    Au.state = Au.states.stateMeeting;
    Au.varMeetingCooldown = Au.TIME_BETWEEN_MEETING;
};
//sabotage [event]
//--event can either be a [task_id] or a gloabl callout
Au.evtSabotage = function(json){
    let evt = json.event;
    //TODO: global events, can do these by setting evt to some flag (e.g. Au.SABOTAGE_POWER) that is not a task id & checking here
    //flag that task as being sabotaged
    let keys = Object.keys(Au.varTasks);
    for(let i=0;i<keys.length;i+=1){
        let task = Au.varTasks[keys[i]];
        if(task.name == evt){
            task.SabotageCooldown = Au.TIME_BETWEEN_SABOTAGE;
        }
    }
    //if you're an imposter, alert that it's been applied
    if(Au.varPlayers[Au.varPlayerId].isImposter){
        alert("task sabotaged: "+evt);
    }
};
//vote [name,from]
//--if (meeting) tally vote.
Au.evtVote = function(json){
    Au.varVotes.push(json);
    //tally votes
    let aliveCount = 0;
    let imposterCount = 0;
    let keys = Object.keys(Au.varPlayers);
    let tally = {};
    for(let i=0;i<keys.length;i+=1){
        let player = Au.varPlayers[keys[i]];
        if(player.isAlive){
            aliveCount+=1;
            tally[player.id] = 0;
        }
        if(player.isImposter){
            imposterCount+=1;
        }
    }
    tally.skip_vote = 0;//"skip_vote" is a reserved vote for skipping the round
    if(imposterCount>=aliveCount){
        //Game over, imposters win with a majority
        alert("Game over, imposters win");
        return;
    }
    //check a majority has been reached (aliveCount/2)
    for(let i=0;i<Au.varVotes.length;i+=1){
        let vote = Au.varVotes[i];
        tally[vote.name]+=1;
    }
    let tallyKeys = Object.keys(tally);
    let maxTally = 0;
    for(let i=0;i<tallyKeys.length;i+=1){
        if(tally[tallyKeys[i]]>maxTally){
            maxTally = tally[tallyKeys[i]];//find the highest vote
        }
    }
    if(tally.skip_vote>=aliveCount/2){//skip was majority
        alert("Nobody voted out: "+tally.skip_vote+" players skipped voting.");
        Au.state = Au.states.statePlaying;
        return;
    }
    if(maxTally<aliveCount/2){//vote was interim
        //not enough votes recorded yet
        return;
    }
    
    let tieCount=0;
    let votedId = "";
    for(let i=0;i<tallyKeys.length;i+=1){
        if(tally[tallyKeys[i]]==maxTally){
            tieCount+=1;
            votedId = tallyKeys[i];
        }
    }
    if(tieCount>1){
        alert("Nobody voted out: "+tieCount+" players tied for votes.");
        Au.state = Au.states.statePlaying;
        return;
    }
    //vote out the player
    if(!votedId){
        alert("unknown player voted out...");//should not get here
    }
    alert("Voting out: "+Au.varPlayers[votedId].displayName);
    Au.evtKill({
        name:votedId,
        from:Au.varPlayerId//TODO: will show a prompt that you've been killed by yourself
    });//kill will check the number of alive characters left
    Au.state = Au.states.statePlaying;
    
};
//name, tag
Au.evtTagInfo = function(json){
    let displayName = Au.varPlayers[json.name].displayName;
    if(Au.state == Au.states.stateViewLog){
        let logText = displayName+", scanned: "+json.tag;
        Au.varLogMessages.unshift(logText);//push message into the start of the array
    }
};

//---local events
Au.handleQR = function(result){
    Au.varLookingAtQr = result;
    Au.varLookingAtTime = Au.TIME_LOOK_AT;//have 3 seconds to act while the QR code is dropped
    
    //send tag scan notification to other players (passive notification)
    Au.sendMessage(JSON.stringify({
        kind:Au.EVENTS.TAG_INFO,
        name:Au.varPlayerId,
        tag:result,
    }));
    
};

//Au.varCurrentTask,Au.varCurrentTaskId); click event
Au.doAction = function(task,qrId){
    if(task == Au.TASKS.KILL){
        if(Au.varKillCooldown<=0){
            let playerId = "";
            let keys = Object.keys(Au.varPlayers);
            for(let i=0;i<keys.length;i+=1){
                let player = Au.varPlayers[keys[i]];
                if(player.playerTag == qrId){
                    playerId = player.id;
                    if(player.isImposter){
                        alert("Target is an imposter.");
                        return;
                    }
                }
            }
            if(!playerId.length){
                alert("Could not find player");
                return;
            }
            Au.sendMessage(JSON.stringify({
                kind:Au.EVENTS.KILL,
                name:playerId,
                from:Au.varPlayerId,
            }));
            Au.varKillCooldown=Au.TIME_BETWEEN_KILL;
        }else{
            alert("Cannot kill yet, need to wait:"+(Math.floor(Au.varKillCooldown/1000))+" seconds.");
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
        let keys = Object.keys(Au.varTasks);
        for(let i=0;i<keys.length;i+=1){
            let task = Au.varTasks[keys[i]];
            if(task.owner == Au.varPlayerId){
                //this is a task, see if it's something you're assigned with
                if(task.name == qrId && !task.isStarted){
                    if(task.SabotageCooldown>0){
                        alert("task is sabotaged, wait: "+Math.floor(task.SabotageCooldown/1000)+" seconds");
                        return;
                    }
                    //yes, it's something you can do: TODO: create more minigames
                    $("#btnCloseTask").attr("data-task",keys[i]);
                    Au.state = Au.states.stateTask;
                    return;//only do 1 task at a time, even if multiple have the same tag
                }
            }
        }
        //else, if you got here, this minigame isn't one of yours
        alert("You don't have to do this task");
        return;
    }
    if(task == Au.TASKS.INTERACT){
        //check if a task you've done can be handed in to a player
        let keys = Object.keys(Au.varTasks);
        for(let i=0;i<keys.length;i+=1){
            let task = Au.varTasks[keys[i]];
            if(task.owner == Au.varPlayerId){
                if(task.isStarted && task.rewardPlayer == qrId){
                    //task complete
                      Au.sendMessage(JSON.stringify({
                            kind:Au.EVENTS.CLEAR_TASK,
                            key:keys[i]
                        }));
                      return;
                }
            }
        }
        
        //else, if you got here it's not a task for you, so instead show the player status
        let rewardPlayer = Au.varPlayers[Au.varPlayerId];
        let playerKeys = Object.keys(Au.varPlayers);
        for(let i=0;i<playerKeys.length;i+=1){
            let player = Au.varPlayers[playerKeys[i]];
            if(player.playerTag == task.rewardPlayer){
                rewardPlayer = player;
            }
        }
        if(rewardPlayer.isAlive){
            alert(rewardPlayer.displayName+" is alive");
        }else{
            //can report a dead body as long as you're alive, no meeting cooldown needed (varMeetingCooldown)
            if(!Au.varPlayers[Au.varPlayerId].isAlive){
                alert(rewardPlayer.displayName+" is dead!\n call meeting?");
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
        if(!Au.varPlayers[Au.varPlayerId].isAlive){
            alert("can't call meeting, you're dead.");
            return;
        }
        if(Au.varMeetingCooldown<=0){
            let doMeeting = confirm("Call meeting?");
            if(doMeeting){
                Au.sendMessage(JSON.stringify({
                      kind:Au.EVENTS.MEETING,
                      host:Au.varPlayerId
                  }));
            }
        }else{
            alert("Cannot call meeting yet, need to wait:"+(Math.floor(Au.varMeetingCooldown/1000))+" seconds.");
        }
    }
    if(task == Au.TASKS.VIEW_LOG){
        Au.varLogMessages = [];
        Au.state = Au.states.stateViewLog;
    }
    
};
Au.scanFromFile =function () {
    let img = new Image();
    let files = $("#iptImgFile")[0].files;
    if(!files.length){
            alert("no selection");
        console.log("no image selected");
        return;
    }
    img.src = window.URL.createObjectURL(files[0]);
    img.onload = function() {
      window.URL.revokeObjectURL(this.src);
      let canvW = img.naturalWidth;
      let canvH = img.naturalHeight;
       let maxImgWidth = 1024;
        if(img.naturalWidth>maxImgWidth){//scale down image to speed up detection
            let scale = maxImgWidth/img.naturalWidth;//keep aspect ratio
            canvW*=scale;
            canvH*=scale;
            canvW = Math.floor(canvW);
            canvH = Math.floor(canvH);
        }
        var canvas = document.createElement('canvas');
        canvas.width =   canvW;
        canvas.height =  canvH;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0 ,canvW,canvH);
        var imgData = context.getImageData(0, 0, canvW, canvH);
        let decodedImg = jsQR(imgData.data, canvW, canvH);
        if(decodedImg){
            Au.handleQR(decodedImg.data);
        }else{
            alert("QR not found");
        }
    };
    
    
};

//resets all minigames for completion again
Au.resetMinigames =function(){
    var doneTask = function(){
        alert("done!");
        let task = $("#btnCloseTask").attr("data-task");
        if(task){
            Au.varTasks[task].isStarted = true;
        }
    };
    //click all the buttons
    $(".btnMinigameA").prop("disabled",false);
    $(".btnMinigameA").off("click");
    $(".btnMinigameA").on("click",function(){
        $(this).attr("disabled","disabled");
        if($("#btnMinigameA1").is(":disabled")&&
           $("#btnMinigameA2").is(":disabled")&&
           $("#btnMinigameA3").is(":disabled")){
            doneTask();
            $("#dvMinigameA").hide();
        }
    });
    
    //make slider 2 match slider 1,3
    let rngB = ["4","3","2","5"];//correct val  == 1, so anything but that
    $("#iptMinigameB2").val(rngB[Math.floor(Math.random()*rngB.length)]);
    $("#iptMinigameB2").off("change");
    $("#iptMinigameB2").on("change",function(){
        if($(this).val()=="1"){
            doneTask();
            $("#dvMinigameB").hide();
        }
    });
    
    //type code into box
    $("#iptMinigameC1").val("");
    let rngC = ["FDS","WER","BNM","IUY","VCX","ZZZ"];
    $("#iptMinigameC2").text(rngC[Math.floor(Math.random()*rngC.length)]);
    $("#iptMinigameC1").off("change");
    $("#iptMinigameC1").on("change",function(){
        let code = $.trim($("#iptMinigameC2").text()).toUpperCase();
        if($("#iptMinigameC1").val().toUpperCase()==code){
            doneTask();
            $("#dvMinigameC").hide();
        }
    });
    
    //check all the switches
    $("#iptMinigameD2").prop("checked",false);//always at least 1 unchecked
    $("#iptMinigameD1").prop("checked",true);
    $("#iptMinigameD3").prop("checked",Math.random()>0.5);
    $(".iptMinigameDcheck").off("change");
    $(".iptMinigameDcheck").on("change",function(){
        if($("#iptMinigameD1").is(":checked")&&
           $("#iptMinigameD2").is(":checked")&&
           $("#iptMinigameD3").is(":checked")){
            doneTask();
            $("#dvMinigameD").hide();
        }
    });
    
    //click X number of times
    $("#spnMinigameE1").text(2+Math.floor(Math.random()*3));
    $("#dvMinigameE2").off("click");
    $("#dvMinigameE2").on("click",function(){
        let value = parseInt($("#spnMinigameE1").text(),10);
        value-=1;
        if(value <=0){
            doneTask();
            $("#dvMinigameE").hide();
        }else{
            $("#spnMinigameE1").text(value);
        }
    });
    
    //do addition
    $("#spnMinigameF1").text(Math.floor(Math.random()*10));
    $("#spnMinigameF2").text(Math.floor(Math.random()*10));
    $("#spnMinigameF3").off("change");
    $("#spnMinigameF3").on("change",function(){
        let value = parseInt($("#spnMinigameF3").val(),10);
        let res1 = parseInt($("#spnMinigameF1").text(),10);
        let res2 = parseInt($("#spnMinigameF2").text(),10);
        if( res1+res2 == value){
            doneTask();
            $("#dvMinigameF").hide();
        }
    });
    //do subtratction
    $("#spnMinigameG1").text(Math.floor(7+Math.random()*7));
    $("#spnMinigameG2").text(Math.floor(Math.random()*7));
    $("#spnMinigameG3").off("change");
    $("#spnMinigameG3").on("change",function(){
        let value = parseInt($("#spnMinigameG3").val(),10);
        let res1 = parseInt($("#spnMinigameG1").text(),10);
        let res2 = parseInt($("#spnMinigameG2").text(),10);
        if( res1-res2 == value){
            doneTask();
            $("#dvMinigameG").hide();
        }
    });
    //do multiplication
    $("#spnMinigameH1").text(Math.floor(2+Math.random()*4));
    $("#spnMinigameH2").text(Math.floor(2+Math.random()*7));
    $("#spnMinigameH3").off("change");
    $("#spnMinigameH3").on("change",function(){
        let value = parseInt($("#spnMinigameH3").val(),10);
        let res1 = parseInt($("#spnMinigameH1").text(),10);
        let res2 = parseInt($("#spnMinigameH2").text(),10);
        if( res1*res2 == value){
            doneTask();
            $("#dvMinigameH").hide();
        }
    });
    
    
};

//debugging on ios using alerts
/*
handleError = function(evt){
    if (evt.message) { // Chrome sometimes provides this
      alert("error: "+evt.message +" at linenumber: "+evt.lineno+" of file: "+evt.filename);
    } else {
      alert("error: "+evt.type+" from element: "+(evt.srcElement || evt.target));
    }
    
};
window.addEventListener("error", handleError, true);
console.warn = function(e){alert(e);}
*/
window.onload = Au.init;

































