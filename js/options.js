// Restores select box state to saved value from localStorage.

$(document).ready(function(){
	$("#refreshrate_option").hover(function(){
		if( $("#refreshrate_ul").css('display') == "none" ){
			$("#refreshrate_ul").slideDown("normal");
		}else{
			$("#refreshrate_ul").slideUp("normal");
		}
	});
	$("#displaytime_option").hover(function(){
		if( $("#displaytime_ul").css('display') == "none" ){
			$("#displaytime_ul").slideDown("normal");
		}else{
			$("#displaytime_ul").slideUp("normal");
		}
	});
	$("div.select_item").click(function(){
		var name = $(this).attr("name");
		var value = parseInt($(this).text());
		addOption(name,value);
		if(name == "refreshrate"){
			$("#refreshrate_title").text(value);
			$("#refreshrate_ul div").removeClass("item_selected");
			$(this).addClass("item_selected");
		}else if(name == "displaytime"){
			$("#displaytime_title").text(value);
			$("#displaytime_ul div").removeClass("item_selected");
			$(this).addClass("item_selected");
		}
	});
	var options = localStorage.getItem("options");
	if( options ){
		var option = JSON.parse(options);
		var notification = option.notification;
		var refreshrate = option.refreshrate;
		var displaytime = option.displaytime;
		if( notification == "On" ){
			$("div[name=notification]").removeClass("selected");
			$("#notification_on").addClass("selected");
		}else{
			$("div[name=notification]").removeClass("selected");
			$("#notification_off").addClass("selected");
		}
		if( refreshrate ){
			$("#refreshrate_title").text(refreshrate);
		}
		if( displaytime ){
			$("#displaytime_title").text(displaytime);
		}
		
	}
	$("div[name=notification]").click( function() {
		if( !$(this).hasClass("selected") ){
			var obj = $(this);
			if( obj.text() == "On" ){
				if(window.webkitNotifications.requestPermission(function() {
    					if(window.webkitNotifications.checkPermission() == 0) {
							changeOption("notification","On");
							$("div[name=notification]").removeClass("selected");
							obj.addClass("selected");
    					} else {
    					}
				}));
			}else{
				changeOption("notification","Off");
				$("div[name=notification]").removeClass("selected");
				$(this).addClass("selected");
			}
		}	
	});
});


function addOption(key,value){
	var option_data = JSON.parse(localStorage.getItem("options"));
	if( !option_data ){
		initOption(key,value);
		option_data = JSON.parse(localStorage.getItem("options"));
	}else{
		option_data[key] = value;
	}
	localStorage.setItem("options",JSON.stringify(option_data));
}


function initOption( key , value){
	var data = {};
	data[key] = value;
	localStorage.setItem("options",JSON.stringify(data));
}

function changeOption(key,new_value){
	var option_data = JSON.parse(localStorage.getItem("options"));
	if( !option_data ){
		initOption(key,new_value);
		return;
	}
	
	for( var index in option_data ){
		if( key == index ){
			option_data[index] = new_value;
		}
	}
	localStorage.setItem("options",JSON.stringify(option_data));
}

