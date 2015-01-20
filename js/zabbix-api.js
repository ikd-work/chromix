var background_rate;
var notification_rate;
var target_priority;
function setOptions(){
	var options = JSON.parse(localStorage.getItem("options"));
	
	if(options){
		if(typeof options.refreshrate == 'undefined'){
			background_rate = 20;
		}else{
			background_rate = JSON.parse(localStorage.getItem("options")).refreshrate;
		}
		if(typeof options.displaytime == 'undefined'){
			notification_rate = 20;
		}else{
			notification_rate = JSON.parse(localStorage.getItem("options")).displaytime;
		}
		if(typeof options.target_priority == 'undefined'){
			target_priority = 0;
		}else{
			target_priority = JSON.parse(localStorage.getItem("options")).target_priority;
		}
        
	}else{
		background_rate = 20;
		notification_rate = 20;
        target_priority = 0;
	}
}

function Login(){
	var url = $("#url").val();
	var username = $("#username").val();
	var password = $("#password").val();
	var https_flag = $("#ssl").is(':checked');

	var auth = getAuth(url,username,password,https_flag);
	if( auth.result != null ){
		if( auth.result == "Connection Error!" ){
			outputError(auth.result);
		}else{
			var data = {
				token:auth.result,
				checktime:parseInt((new Date)/1000),
				https:https_flag,
				account:{username:username,password:password},
				};
			setEncryptedData(url,data);
			location.reload();
			outputMsg("Login Success");
		}
	}else{
		outputError("Login Failure!");
	}
}

//API Access Authentication
function getAuth(url, user, password, https_flag) {
	var params = {"user":user, "password":password};
	var authRequest = new Object();
		authRequest.params = params;
		authRequest.auth = null;
		authRequest.jsonrpc = '2.0';
		authRequest.id = 0;
		authRequest.method = 'user.authenticate';
	var authJsonRequest = JSON.stringify(authRequest);
	var authResult = new Object();
	var api_url = getApiUrl(url,https_flag);
	$.ajaxSetup({
		timeout: 2000
	});
	$.ajax({
		url: api_url,
		username: user,
		password: password,
		contentType: 'application/json-rpc',
		dataType: 'json',
		type: 'POST',
		processData: false,
		timeout: 2000,
		async: false, 
		data: authJsonRequest,
		success: function(response){
			authResult = response;
		},
		error: function(response,status,errorThrown){
			authResult.result = "Connection Error!";
		},
    });
    return(authResult); 
}

function substrHostname(hostname){
    var result = "";
    if( hostname.length > 28 ){
        result = hostname.substr(0,28);
        result += "...";
    }else{
        result = hostname;
    }
    return result;
}

// Main
function showSelectBox(){
    var selectbox_str = "<ul id=selectedhost>";
    var select_itemname = localStorage.getItem("selected");
    if( select_itemname != null ){
        if( getHttpsFlag(select_itemname) ){
            selectbox_str += "<li title=" + select_itemname + "><img width=10px height=12px src='image/secure.ico'><span id=selected>" + substrHostname(select_itemname) + "</span><span id=icon></span><ul id=hostlist>";
        }else{
            selectbox_str += "<li title=" + select_itemname + "><span id=selected>" + substrHostname(select_itemname) + "</span><span id=icon></span><ul id=hostlist>";
        }

        for( var key in localStorage ){
            if( key == "options" || key == "selected" ){
                continue;
            }
            var secure_image = "";
            if( getHttpsFlag(key) ){
                secure_image = "<span align=right><img width=10px height=12px src='image/secure.ico'></span>";
            }
            if( select_itemname == key ){
                selectbox_str += "<li value=" + convertID(key) + " title=" + key + " class=selected><a href=#>" + secure_image + substrHostname(key) + "</a><span class=trash title=delete></span></li>";
            }else{
                selectbox_str += "<li value=" + convertID(key) + " title=" + key + "><a href=#>" + secure_image + substrHostname(key) + "</a><span class=trash title=delete></span></li>";
            }
        }
        selectbox_str += "</ul></li></ul>";
        $("#select").html(selectbox_str);
        $("ul#hostlist").hide();
        $("ul#selectedhost").hover(function(){
            $("ul:not(:animated)", this).slideDown("fast");
        },function(){
            $("ul#hostlist",this).slideUp("fast");
        });
        $("ul#hostlist li a").click(function(){
            $("#hostlist li").removeClass("selected");
            $(this).parent("li").addClass("selected");
            selected = $(this).parent("li").attr("title");
            localStorage.setItem("selected",selected);
            selectedTriggerView(localStorage.getItem("selected"));
            $("#selected").text(substrHostname(selected));
            $("#selected").parent().attr("title",selected);
        });
    }else{
        selectbox_str += "<li title=nodata>no host</li></ul>";
        $("#select").html(selectbox_str);
    }
}

function selectedTriggerView(selected_tab){
	for( var key in localStorage ){
		if( key == "options" || key == "selected" ){
			continue;
		}
		var storage_data = getDecryptedData(key);
		var token = storage_data.token;
		var checktime = storage_data.checktime;
		var https_flag = getHttpsFlag(key);
		var account = storage_data.account;
		if( !account ){ account = {username:"",password:""}; };
		if( localStorage.getItem("selected") == null ){
			localStorage.setItem("selected",key);
			getTriggerList(key,token,checktime,https_flag,account);
		}else if( localStorage.getItem("selected") == key ){    
			getTriggerList(key,token,checktime,https_flag,account);
		}
	}
}

function getTriggerList(url,token,checktime,https_flag,account){
	var rpcid = 3;
	var filter = new Object();
		filter.status = 0;
		filter.value = 1;
	var params = new Object();
		params.output = "extend";
		params.expandData = 1;
		params.expandDescription = 1;
		params.limit = 100;
		params.monitored = 1;
		params.sortfield = "lastchange";
		params.sortorder = "DESC";
		params.filter = filter;
	getZabbixData(rpcid, url, token, "trigger.get", params, https_flag, account);
}

function updateTime(key){
	var storage_data = getDecryptedData(key);
	var token = storage_data.token;
	var https_flag = getHttpsFlag(key);
	var account = storage_data.account;
	if( !account ){ account = {username:"",password:""}; };
	var data = {
	token:token,
	checktime:parseInt((new Date)/1000),
	https:https_flag,
	account:account
	};
	setEncryptedData(key,data);
}

function refreshTriggerCount(){
	var one_counter = 0;
	var counter = 0;
	for( var key in localStorage ){
		if( key == "options" || key == "selected" ){
			continue;
		}
		var storage_data = getDecryptedData(key);
		var token = storage_data.token;
		var checktime = storage_data.checktime;
		var https_flag = getHttpsFlag(key);
		var alltrigger = getAllTrigger(key,token,checktime, https_flag);
		if( alltrigger == "error" ){
			changeErrorTab(convertID(key));
		}else{
			for(var index in alltrigger.result) {
				for ( var itemname in alltrigger.result[index]){
					if( itemname == "lastchange"){
						if( checktime < alltrigger.result[index][itemname] ){
							one_counter++;
						}
					}
				}
			}
			if(one_counter > 0){
				changeTabDesign(convertID(key));
			}
			counter += one_counter;
			one_counter = 0;
		}
	}
	if( counter == 0 ){
		chrome.browserAction.setBadgeText({text:""});
	}else{
		chrome.browserAction.setBadgeText({text:String(counter)});
	}
}


// Trigger Table Output

function showResult(response,url,https_flag){
	var strTable = "";
	strTable += "<table id=main data-filter=#filter class='footable'>";
	if( response.error ){
		strTable += "<div class=noconnection>Not Connected!</div>";
		outputError("Not Connected!");
	}else if( response.result == "" ){
		strTable += "<div class=nodata>No Trouble!</div>";
	}else{
		strTable += "<thead><tr><th data-class=expand>Description</th><th data-hide=all>Comments</th><th data-hide=all>Error</th><th>Time</th><th>Host</th><th>Priority</th></thead><tbody>";
		for(var index in response.result) {
			strTable += "<tr>";
			for ( var itemname in response.result[index]){
				if ( itemname == "host"){
					var hostname = response.result[index][itemname];
				}else if( itemname == "description") {
					var description = response.result[index][itemname];
				}else if( itemname == "lastchange"){
					var TZ = +0;
					var unixtime = response.result[index][itemname];
					var time =  unixtimeToDate(parseInt(response.result[index][itemname]),TZ);
				}else if( itemname == "triggerid"){
					var pageurl = "";
					if( https_flag ){
						pageurl = "https://" + url + "/events.php?triggerid=" + response.result[index][itemname];
					}else{
						pageurl = "http://" + url + "/events.php?triggerid=" + response.result[index][itemname];
					}
				}else if( itemname == "priority"){
                    var priority = response.result[index][itemname];
					var priority_name = getPriorityString(priority);
				}else if( itemname == "comments"){
                    var comments = response.result[index][itemname];
                }else if( itemname == "error"){
                    var error = response.result[index][itemname];
                }
			}
			var class_name = "old";
			if( unixtime >= getDecryptedData(url).checktime ) {
				class_name = "new";
			}
			strTable += "<td class='" + class_name + " " + priority_name  + "'><span id=new_flag>NEW</span><a href=" + pageurl + " target=_blank >" + description + "</a></td><td>" + comments +"</td><td>" + error + "</td><td class=" + class_name + ">" + time + "</td><td class=" + class_name + ">" + hostname + "</td><td><span style=visibility:hidden>" + priority + "</span>" + priority_name +"</td>";
			strTable += "</tr>";
		}
	}
	strTable += "</tbody></table><br>";
	$("#datatable").fadeOut("normal",function(){
		$("#datatable").html(strTable);
		$("#datatable").fadeIn();
        $('.footable').footable();
        $("#datatable table > tbody > tr:odd").addClass("odd");
        $("#datatable table > tbody > tr:even").addClass("even");
	});
	updateTime(url);
	refreshTriggerCount();
}

function getApiUrl(url,https_flag){
	if( https_flag ){
		return( "https://" + url + "/api_jsonrpc.php" );
	}else{
		return( "http://" + url + "/api_jsonrpc.php" );
	}	
}

// Access Zabbix API and Get Data
function getZabbixData(rpcid, url, authid, method, params, https_flag, account) { 
	var dataRequest = new Object();
		dataRequest.params = params;
		dataRequest.auth = authid;
		dataRequest.jsonrpc = '2.0';
		dataRequest.id = rpcid;
		dataRequest.method = method;
	var dataJsonRequest = JSON.stringify(dataRequest);		
	var api_url = getApiUrl(url,https_flag);
	$.ajax({
		type: 'POST',
		url: api_url,
		username: account.username,
		password: account.password,
		contentType: 'application/json-rpc',
		dataType: 'json',
		processData: false,
		data: dataJsonRequest,
		timeout: 10000,
		success: function(response){
			clearMsg();
			showResult(response,url,https_flag);
		},
		error: function(response){
			outputError("Connection Error!");
			
			$("#datatable").fadeOut("normal",function(){
				var str = "<table>";
				str += "<div class=noconnection>Not Connected!</div>";
				str += "</table><br>";
				$("#datatable").html(str);
				$("#datatable").fadeIn();
			});
		},
	});
}

// function

function Sleep( T ){ 
   var d1 = new Date().getTime(); 
   var d2 = new Date().getTime(); 
   while( d2 < d1+1000*T ){    //T秒待つ 
       d2=new Date().getTime(); 
   } 
   return; 
} 


function htmlResize(){
	var height = $("#datatable").height() + $("#datatable").offset().top;
	$("html").animate({"height":height},"slow","linear");
	$("body").animate({"height":height},"slow","linear");
}

function unixtimeToDate(ut, TZ) {
	var tD = new Date( ut * 1000 );
	tD.setTime( tD.getTime() + (60*60*1000 * TZ) );
	var yy = tD.getYear();
	var mm = tD.getMonth() + 1;
	var dd = tD.getDate();
	if (yy < 2000) { yy += 1900; }
	if (mm < 10) { mm = "0" + mm; }
	if (dd < 10) { dd = "0" + dd; }
	var time = yy + "/" + mm + "/" + dd + " " + tD.getHours() + ":" + tD.getMinutes() + ":" + tD.getSeconds();
	return time;
}


function changeTabDesign(id){
	$("#"+id).css('border-left','2px solid #ff69b4');
	$("#"+id).css('border-top','2px solid #ff69b4');
	$("#"+id).css('border-right','2px solid #ff69b4');
}

function changeErrorTab(id){
	$("#"+id).css('background-color','#a9a9a9');
	$("#"+id).css('border-left','2px solid #a9a9a9');
	$("#"+id).css('border-top','2px solid #a9a9a9');
	$("#"+id).css('border-right','2px solid #a9a9a9');
}

function convertID(key){
	return key.replace(/\/|\./g,"_");
}

function Logout(key){
	localStorage.removeItem(key);
    if( key == localStorage.getItem("selected") ){
        localStorage.removeItem("selected");
    }
    location.reload();
}

function clearMsg(){
	$("#error").fadeOut("slow");
	$("#message").fadeOut("slow");
}

function outputError(msg){
	$("#error").text(msg);
	$("#error").fadeIn("slow");
}

function outputMsg(msg){
	$("#message").text(msg);
	$("#message").fadeIn("slow");
}

/* for Backend.html */

function getAllTrigger(url, token, ckecktime, https_flag) { // "params"はJSON形式の文字列リテラルかJSONに変換可能なオブジェクト
	var rpcid = 2;
	var filter = new Object();
	    filter.status = 0;
	    filter.value = 1;
	var params = new Object();
	    params.output = "extend";
	    params.expandData = 1;
	    params.expandDescription = 1;
	    params.limit = 100;
   		params.sortfield = "lastchange";
		params.sortorder = "DESC";
	    params.filter = filter;
	var dataRequest = new Object();
		dataRequest.params = params;
		dataRequest.auth = token;
		dataRequest.jsonrpc = '2.0';
		dataRequest.id = rpcid;
		dataRequest.method = "trigger.get";
	var dataJsonRequest = JSON.stringify(dataRequest);
	var allTrigger = new Object();
	var api_url = getApiUrl(url,https_flag);
	$.ajax({
		type: 'POST',
		url: api_url,
		contentType: 'application/json-rpc',
		dataType: 'json',
		processData: false,
		timeout: 10000,
		async: false,
		data: dataJsonRequest,
		success: function(response){
			allTrigger = response;
		},
		error: function(response){
			allTrigger = "error";
		},
	});
	return(allTrigger);
}

function notificationCheck(trigger_data){
	var now = parseInt((new Date)/1000);
	var last_checktime = now - background_rate;
	var msg = "";
	if(last_checktime < trigger_data["lastchange"] ){
		msg += trigger_data["host"];
		msg += ":";
		msg += trigger_data["description"];
        if( target_priority <= parseInt(trigger_data["priority"])){
		    popupNotification(msg,trigger_data["priority"]);
        }
	}
}

function getHttpsFlag(key){
	var https_flag = getDecryptedData(key).https;
	if( typeof https_flag == "undefined" ){
		https_flag = false;
	}
	return https_flag;
}

function checkTriggerCount(){
	setOptions();
	var counter = 0;
	var error_counter = 0;
	for( var key in localStorage ){
		if( key == "options" || key == "selected" ){
			continue;
		}
		var storage_data = getDecryptedData(key);
		var token = storage_data.token;
		var checktime = storage_data.checktime;
		var https_flag = getHttpsFlag(key);
		var alltrigger = getAllTrigger(key,token,checktime,https_flag);
		if( alltrigger == "error" ){
			error_counter++;
		}else{
			for(var index in alltrigger.result) {
				notificationCheck(alltrigger.result[index]);
				for ( var itemname in alltrigger.result[index]){
					if( itemname == "lastchange"){
						if( checktime < alltrigger.result[index][itemname] ){
							counter++;
						}
					}
				}
			}
		}
	}
	if( counter == 0 ){
		chrome.browserAction.setBadgeText({text:""});
	}else{
		chrome.browserAction.setBadgeText({text:String(counter)});
	}
	if( error_counter == 0 ){
		chrome.browserAction.setIcon({path:"image/chromix_normal_icon.png"});
	}else{
		chrome.browserAction.setIcon({path:"image/chromix_error_icon.png"});
	}
	setTimeout(function(){ checkTriggerCount(); },1000*background_rate);
}

function popupNotification(msg,priority){
    var msg_title = getPriorityString(priority).toUpperCase() + " alert!";
	if( localStorage.getItem("options") ){
		if( JSON.parse(localStorage.getItem("options")).notification == "On" && Notification.permission === "granted"){
			var notification = new Notification(msg_title, {
                icon: "image/warning.png",
                body: msg}
			);
			
			setTimeout(function(){
				notification.close();
			},1000*notification_rate);
		}
	}
}

function encryptData(data){
	var secretkey = "secretkey";
	return des.encrypt(data,secretkey);
}

function decryptData(data){
	var secretkey = "secretkey";
	return des.decrypt(data,secretkey);
}

function getDecryptedData(key){
	if(decryptData(localStorage.getItem(key)).indexOf("token") != -1){
		return jsonParse(decryptData(localStorage.getItem(key)));
	}else{
		return jsonParse(localStorage.getItem(key));
	}
}

function setEncryptedData(key,data){
	var json_data = JSON.stringify(data);
	var enc_json_data = encryptData(json_data);
	localStorage.setItem(key,enc_json_data);
}

function jsonParse(data){
	return JSON.parse(data);
}

function getPriorityString(priority){
    switch (priority){
        case "0":
            return "unknown";
        case "1":
            return "information";
        case "2":
            return "warning";
        case "3":
            return "average";
        case "4":
            return "high";
        case "5":
            return "disaster";
    }
}
    
