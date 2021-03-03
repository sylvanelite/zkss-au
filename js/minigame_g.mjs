

export default class MinigameG  {
  constructor() {}
  
  init(){
  let template = `
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
	
  `;
  $("#dvMinigames").prepend($(template));
  }
  reset(doneTask){
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
  
  }
  
}


