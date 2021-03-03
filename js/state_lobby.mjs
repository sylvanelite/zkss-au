
import Au from "./globals.mjs";

export default class StateLobby {
  constructor() {}
  
  init(){
    let lobbyTemplate = `
	<div style="display:none;color: white;" id="dvLobby">
		<section class="py-5 text-center container">
			<div id="dvRoomName">
				
			</div>
			current players:
			<div id="dvCurrentPlayers" data-needsRefresh="true">
				
			</div>
			<br/>
			<br/>
			<div class="input-group">
				<input id="iptPlayerName" name="iptPlayerName" value="" class="form-control"/>
				<button id="btnPlayerJoin"  class="btn btn-secondary">Ready</button>
			</div>
			<br/>
			
			<button id="btnStart" style="display:none;" disabled="disabled"   class="btn btn-secondary">START GAME</button>
			<br/>
		</section>
		
	</div>`;
  $("#main").append($(lobbyTemplate));
    $("#btnPlayerJoin").on("click",function(){
        var name= $("#iptPlayerName").val();
        if(!name.length){
            alert("Enter a name first.");
            return;
        }
        //parse out non alphanumeric
        Au.varPlayers[Au.varPlayerId].displayName=name.replace(/\W/g, '');
        $("#btnPlayerJoin").attr("disabled","disabled");
        $("#iptPlayerName").attr("disabled","disabled");
        $("#btnStart").prop("disabled",false);
        Au.sendMessage(JSON.stringify({
            kind:Au.EVENTS.JOIN,
            playername:Au.varPlayers[Au.varPlayerId].displayName,
            id:Au.varPlayerId
        }));
    });
    $("#btnStart").on("click",function(){
        if(!$("#iptPlayerName").is(":disabled")){
            alert("You are not ready");
            return;
        }
        let seed = Math.floor(Math.random()*10000);
        Au.sendMessage(JSON.stringify({
            kind:Au.EVENTS.START,
            seed:seed
        }));
        $("#btnStart").attr("disabled","disabled");
    });
    
    
    
  }
  hide(){
    $("#dvLobby").hide();
  }
  render(){
    $("#dvLobby").show();
    if($("#dvCurrentPlayers").attr("data-needsRefresh") == "true"){
        let dvPlayerText = "";
        let keys=Object.keys(Au.varPlayers);
        for(let i=0;i<keys.length;i+=1){
            if(keys[i] == Au.varPlayerId){
                continue;
            }
            let player = Au.varPlayers[keys[i]];
            dvPlayerText+="<li  class='list-group-item list-group-item-primary'>"+player.displayName+"</li>";
        }
        $("#dvCurrentPlayers").html("<ul  class='list-group list-group-flush'>"+dvPlayerText+"</ul>");
        $("#dvRoomName").text("ROOM: "+Au.varArea);
        $("#dvCurrentPlayers").attr("data-needsRefresh",false);
    }
  }
  update(){
    //no-op here, nothing to do in main loop for update
  }
  
}


