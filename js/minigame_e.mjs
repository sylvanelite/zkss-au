

export default class MinigameE {
  constructor() {}
  
  init(){
  let template = `
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
  `;
  $("#dvMinigames").prepend($(template));
  }
  reset(doneTask){
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
    
  
  }
  
}


