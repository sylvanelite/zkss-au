

export default class MinigameD {
  constructor() {}
  
  init(){
  let template = `
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameD"
		 class="minigame">
		<div class="row">
			<div class="col-3"></div>
			<div class="col-6">
				<div class="form-check form-switch iptMinigameDcheck">
					<input class="form-check-input" type="checkbox" id="iptMinigameD1" >
				</div>
				<div class="form-check form-switch iptMinigameDcheck">
					<input class="form-check-input" type="checkbox" id="iptMinigameD2" checked>
				</div>
				<div class="form-check form-switch iptMinigameDcheck">
					<input class="form-check-input" type="checkbox" id="iptMinigameD3" >
				</div>
			</div>
		</div>
	</div>
	
  `;
  $("#dvMinigames").prepend($(template));
  }
  reset(doneTask){
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
    
  
  }
  
}


