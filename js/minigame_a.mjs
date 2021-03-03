

export default class MinigameA {
  constructor() {}
  
  init(){
  let template = `
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameA"
		 class="minigame">
		
		<button id="btnMinigameA1" class="btnMinigameA btn btn-info" style="position:fixed;left:100px;top:100px;width:6em;height:6em;">A</button>
		<button id="btnMinigameA2" class="btnMinigameA btn btn-info"  style="position:fixed;left:200px;top:200px;width:6em;height:6em;">B</button>
		<button id="btnMinigameA3" class="btnMinigameA btn btn-info"  style="position:fixed;left:300px;top:100px;width:6em;height:6em;">C</button>
		
	</div>
  `;
  $("#dvMinigames").prepend($(template));
  }
  reset(doneTask){
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
    
  
  }
  
}


