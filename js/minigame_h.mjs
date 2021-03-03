

export default class MinigameA {
  constructor() {}
  
  init(){
  let template = `
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameH"
		 class="minigame">
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
				<h3 style="color:white;" ><span  id="spnMinigameH1"></span> x
				<span  id="spnMinigameH2"></span> = </h3>
			</div>
		</div>
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
					<input type="number" id="spnMinigameH3" value="" class="form-control">
			</div>
		</div>
	</div>
	
  `;
  $("#dvMinigames").prepend($(template));
  }
  reset(doneTask){
    
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
    
  
  }
  
}


