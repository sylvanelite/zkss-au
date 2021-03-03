

export default class MinigameF {
  constructor() {}
  
  init(){
  let template = `
	
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
  `;
  $("#dvMinigames").prepend($(template));
  }
  reset(doneTask){
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
  
  }
  
}


