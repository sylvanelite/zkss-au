

export default class MinigameA {
  constructor() {}
  
  init(){
  let template = `
	<div style="display: none;width:100%;position:fixed;height:100%;left:0px;top:0px;background-color:#333333;" id="dvMinigameC"
		 class="minigame">
		<div class="container">
			<div class="row">
				<div class="col-3"></div>
				<div class="col-6"  style="color:white;">Code: <span id="iptMinigameC2"></span></div>
			</div>
			<div class="row">
				<div class="col-3"></div>
				<div class="col-6">
					<input type="text" id="iptMinigameC1" value="" class="form-control">
				</div>
			</div>
			
		</div>
	</div>
  `;
  $("#dvMinigames").prepend($(template));
  }
  reset(doneTask){
    //type code into box
    $("#iptMinigameC1").val("");
    let rngC = ["FDS","WER","BNM","IUY","VCX","ZZZ"];
    $("#iptMinigameC2").text(rngC[Math.floor(Math.random()*rngC.length)]);
    $("#iptMinigameC1").off("change");
    $("#iptMinigameC1").on("change",function(){
        let code = $.trim($("#iptMinigameC2").text()).toUpperCase();
        if($("#iptMinigameC1").val().toUpperCase()==code){
            doneTask();
            $("#dvMinigameC").hide();
        }
    });
    
  }
  
}


