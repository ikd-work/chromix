// Restores select box state to saved value from localStorage.

$(document).ready(function(){
	$("#refreshrate_option").hover(function(){
        $("ul:not(:animated)",this).slideDown("fast");
    },function(){
        $("ul#refreshrate_ul",this).slideUp("fast");
	});
	$("#displaytime_option").hover(function(){
        $("ul:not(:animated)",this).slideDown("fast");
    },function(){
        $("ul#displaytime_ul",this).slideUp("fast");
    });
    $("#target_priority_option").hover(function(){
        $("ul:not(:animated)",this).slideDown("fast");
    },function(){
        $("ul#target_priority_ul",this).slideUp("fast");
	});
	$("div.select_item").click(function(){
		var name = $(this).attr("name");
		var value = $(this).parent().val();
		addOption(name,value);
		if(name == "refreshrate"){
			$("#refreshrate_title").text(value);
			$("#refreshrate_ul div").removeClass("item_selected");
			$(this).addClass("item_selected");
		}else if(name == "displaytime"){
			$("#displaytime_title").text(value);
			$("#displaytime_ul div").removeClass("item_selected");
			$(this).addClass("item_selected");
		}else if(name == "target_priority"){
			$("#target_priority_title").text(getTargetLevelString(value));
			$("#target_priority_ul div").removeClass("item_selected");
			$(this).addClass("item_selected");
		}
	});
	var options = localStorage.getItem("options");
	if( options ){
		var option = JSON.parse(options);
		var notification = option.notification;
		var refreshrate = option.refreshrate;
		var displaytime = option.displaytime;
        var target_priority = option.target_priority;
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
		if( target_priority ){
			$("#target_priority_title").text(getTargetLevelString(target_priority));
		}
		
	}
	$("div[name=notification]").click( function() {
		if( !$(this).hasClass("selected") ){
			var obj = $(this);
			if( obj.text() == "On" ){
				if(window.webkitNotifications.requestPermission(function() {
    					if(window.webkitNotifications.checkPermission() == 0) {
							addOption("notification","On");
							$("div[name=notification]").removeClass("selected");
							obj.addClass("selected");
    					} else {
    					}
				}));
			}else{
				addOption("notification","Off");
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

function getTargetLevelString(level){
    switch (level){
        case 0:
            return 'Over "UNKNOWN" level(all level)';
        case 1:
            return 'Over "INFORMATION" level';
        case 2:
            return 'Over "WARNING" level';
        case 3:
            return 'Over "AVERAGE" level';
        case 4:
            return 'Over "HIGH" level';
        case 5:
            return 'Over "DISASTER" level';
    }
}
