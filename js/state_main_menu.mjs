
import Au from "./globals.mjs";

export default class StateMainMenu {
  constructor() {}
  
  init(){
    let mainTemplate = `
	<div id="dvMainMenu">
		<section class="py-5 text-center container">
		<div class="row py-lg-5">
		  <div class="col-lg-6 col-md-8 mx-auto">
			<p>
				<button id="btnCreateRoom" class="btn btn-secondary" style="width:5em;">Create</button>
				<br/>
				<br/>
				<button id="btnJoinRoom" class="btn btn-secondary" style="width:5em;">Join</button>
			</p>
		  </div>
		</div>
	  </section>
	</div>`;
  $("#main").append($(mainTemplate));
    
    //btnCreateRoom
    $("#btnCreateRoom").on("click",function(){
      
        Au.varArea = Au.getRandomString(3);
        //TODO: this nukes the entire server, not just the current area
        //NOTE: this means clicking "create" will nuke currently created rooms
        Au.resetServer();
        Au.varMessageId = 0;
        Au.state = Au.states.stateLobby;
        Au.mainLoop();
        
        $("#btnStart").show();
    });
    //btnJoinRoom
    $("#btnJoinRoom").on("click",function(){
        Au.varArea = prompt("Enter host code:");
        Au.varArea = Au.varArea.toUpperCase();
        Au.varMessageId = 0;
        Au.state = Au.states.stateLobby;
        Au.mainLoop();
    });
    
    
    
  }
  hide(){
    $("#dvMainMenu").hide();
  }
  render(){
    if(!$("#dvMainMenu").is(":visible")){
        $("#dvMainMenu").show();
    }
  }
  update(){
    //no-op here, nothing to do in main loop for update
  }
  
}


