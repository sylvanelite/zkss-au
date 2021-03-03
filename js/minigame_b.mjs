

export default class MinigameB {
  constructor() {}
  
  init(){
  let template = `
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameB"
		 class="minigame">
		<input id="iptMinigameB1"  type="range" class="form-range" min="0" max="5" step="0.5" id="customRange3" disabled="disabled" value="1">
		<input id="iptMinigameB2"  type="range" class="form-range" min="0" max="5" step="0.5" id="customRange3" value="4">
		<input id="iptMinigameB3"  type="range" class="form-range" min="0" max="5" step="0.5" id="customRange3" disabled="disabled" value="1">
	</div>
	
  `;
  $("#dvMinigames").prepend($(template));
  }
  reset(doneTask){
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
  }
  
}


