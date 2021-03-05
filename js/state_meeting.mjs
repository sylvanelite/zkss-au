
import Au from "./globals.mjs";

export default class StateMeeting {
  constructor() {
    this.varMeetingHost = "";
  }
  
  init(){
    let meetingTemplate = `
  
	<div id="dvMeeting" class="container" style="display:none;">
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
				<span style="color:white;">Cast your vote:</span>
			</div>
			<div class="col-3"></div>
		</div>
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6" id="dvMeetingVote">
				<div class="form-check">
					<label style="color:white;" class="form-check-label"> Skip
						<input type="radio" name="rdVote" value="skip_vote" class="form-check-input">
					</label>
				</div>
			</div>
			<div class="col-3"></div>
		</div>
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6" id="">
				<span  style="color:white;" class="form-check-label">
					Task progress:
				<progress id="prgTasks" max="100" value="0"> 0% </progress>
				</span>
			</div>
			<div class="col-3"></div>
		</div>
		<div class="row">
			<div class="col-12"id="dvMeetingVote">
				<button id="btnVote" style="position:fixed;bottom:0px;width:6em;height:6em;margin:1em;" class="btn btn-secondary">Vote</button>
			</div>
		</div>
	
	</div>
  
  `;
  $("#main").append($(meetingTemplate));
  
    $("#btnVote").on("click",function(){
        //TODO: here
        $("#btnVote").attr("disabled","disabled");
        let selectedPlayer = $("[name=rdVote]:checked").val();
        if(!selectedPlayer){
            alert("Select a vote first");
            return;
        }
        Au.sendMessage(JSON.stringify({
               kind:Au.EVENTS.VOTE,
               from:Au.varPlayerId,
               name:selectedPlayer
           }));
    });
    
    
  }
  hide(){    
    $("#dvMeeting").hide();
  }
  render(){
    let self = this;
    if(!$("#dvMeeting").is(":visible")){
        $("#dvMeeting").show();
        $(".voteItem").remove();
        //refresh with meeting options
        let allPlayers = Au.middleware.getAllPlayers();
        let playerKeys = Object.keys(allPlayers);
        for(let i=0;i<playerKeys.length;i+=1){
            let player = allPlayers[playerKeys[i]];
            if(player.isAlive){
                let hostIndicator = "";
                if(player.id == self.varMeetingHost){
                    hostIndicator="*";
                }
                $("#dvMeetingVote").prepend($(`
                    <div class="voteItem form-check">
                        <label style="color:white;"  class="form-check-label">
                        ${player.playerTag}: ${player.displayName}${hostIndicator}
                            <input type="radio" name="rdVote" value="${player.id}" class="form-check-input">
                        </label>
                    </div>`));
            }else{
                $("#dvMeetingVote").prepend($(`
                    <div class="voteItem">
                        <s style="color:#888888;">
                        ${player.playerTag}: ${player.displayName}
                        </s>
                    </div>`));
            }
        }
        //show progress level
        //<progress id="prgTasks" max="100" value="0"> 0% </progress>
        /*
        //TODO: progress bar, note: if theres only 1 imposter 0 tasks will be populated
        let taskKeys = Object.keys(Au.varTasks);
        let max = taskKeys.length;
        let cur = 0 ;
        for(let i=0;i<taskKeys.length;i+=1){
            let task = Au.varTasks[taskKeys[i]];
            if(task.isClear){
                cur+=1;
            }
        }
        let progress = Math.floor((cur/max)*100);
        $("#prgTasks").val(progress);
        $("#prgTasks").text(progress+"%");
        */
        //show the vote button iff you're alive
        let selfPlayer = Au.middleware.getPlayer(Au.varPlayerId);
        if(selfPlayer.isAlive){
          $("#btnVote").prop("disabled",false);
        }else{
          $("#btnVote").attr("disabled","disabled");
        }
    }
    let ctx = Au.canvas.getContext("2d");
    ctx.clearRect(0,0,Au.canvas.width,Au.canvas.height);
    //NOTE: nothing to draw on canvas just yet
  }
  update(){
    //no-op for meeting
  }
  
}


