$(document).ready(function(){
	setOptions();
//	getTab();
    showSelectBox();
	$(function() {
		$("input").css('color', '#999');
		var input_val = [];
		$("input").each(function() {
			input_val.push($(this).val());
		});
		$("input").focus(function() {
			var chk_num = $("input").index(this);
			var chk_val = $("input").eq(chk_num).val();
			if(chk_val == input_val[chk_num]) {
				var def_val = $(this).val();
				$(this).val('');
				$(this).css('color', '#333');
				$(this).blur(function() {
					if($(this).val() == '') {
						$(this).val(def_val);
						$(this).css('color', '#999');
					}
				});
			}
		});
	});	
	$("#add").click(function(){
		displayLoginBox();
	});
	$("#button").click(function(){
		Login();
	});
	$("#logout").live('click',function(){
		Logout($(this).attr("name"));
	});
    $("#hostlist").mouseover(function(){
        console.log("hostlist hover");
    });
    $("#filter").focus(function(){
        $(this).animate({"width":"200px"},"normal");
    });
    $("#filter").blur(function(){
        $(this).animate({"width":"117px"},"normal");
    });
});
selectedTriggerView(sessionStorage.getItem("selected"));

$(document).keydown(function(e){

		var keyCode = e.keyCode;
		if( (keyCode == 13) && ( $("#login").css('display') != "none" ) ){
			$("#button").trigger("click");
		}
});

