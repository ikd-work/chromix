var background_rate;
var notification_rate;
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
	}else{
		background_rate = 20;
		notification_rate = 20;
	}
}

function displayLoginBox(){
	$("html").focus();
	clearMsg();
	if( $("#login").css('display') == "none" ){
		$("#login").slideDown("slow");
		$("#add").text("Close Box");
		$("#login").focus();
	}else{
		$("#login").slideUp("slow",function(){
			$("#add").text("Add Zabbix");
			htmlResize();
		});
	}
}

function Login(){
	var url = $("#url").val();
	var username = $("#username").val();
	var password = $("#password").val();
	var https_flag = $("#ssl").is(':checked');
	var basic_flag = $("#basic").is(':checked');

	var auth = getAuth(url,username,password,https_flag);
	if( auth.result != null ){
		if( auth.result == "Connection Error!" ){
			outputError(auth.result);
		}else{
			var data = {
			token:auth.result,
			checktime:parseInt((new Date)/1000),
			https:https_flag
			};
			if( basic_flag ){
				data["basic"] = {username:username,password:password};
			}
			var json_data = JSON.stringify(data);
			localStorage.setItem(url,json_data);
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
		async: false, // 認証が終わらないと次の処理ができないので、ここは同期通信に。
		data: authJsonRequest,
		success: function(response){
			authResult = response;
		},
		error: function(response,status,errorThrown){
			authResult.result = "Connection Error!";
		},
    });
    return(authResult); // 認証結果をObjectとして返して"auth.id", "auth.result"で取り出す。
}

// Main

function getTab(){
	var tab_str = "<ul>"; 
	var count = 0;
	for( var key in localStorage ){
		if( key == "options" ){
			continue;
		}
		if( sessionStorage.getItem("selected") == key ){
			tab_str += "<li id=" + convertID(key) + " class=selected_tab >" + getTabValue(key);
		}else{
			tab_str += "<li id=" + convertID(key) + " class=tab >" + getTabValue(key);
		}
		count++;
	}
	tab_str += "</ul>";
	$("#tab").html(tab_str);
	$("li.tab").click(function(){
		sessionStorage.setItem("selected",$(this).text());
		selectedTabView(sessionStorage.getItem("selected"));
	});
}

function getTabValue(key){
	if( getHttpsFlag(key) ){
		return("<a href=#><img width=12px height=12px src='image/secure.ico'>"  + key + "</a></li>");
	}else{
		return("<a href=#>" + key + "</a></li>");
	}
}

function selectedTabView(selected_tab){
	for( var key in localStorage ){
		if( key == "options" ){
			continue;
		}
		var token = JSON.parse(localStorage.getItem(key)).token;
		var checktime = JSON.parse(localStorage.getItem(key)).checktime;
		var https_flag = getHttpsFlag(key);
		if( sessionStorage.getItem("selected") == null ){
			sessionStorage.setItem("selected",key);
			getTriggerList(key,token,checktime,https_flag);
			getTab();
		}else if( sessionStorage.getItem("selected") == key ){    
			getTriggerList(key,token,checktime,https_flag);
			getTab();
		}
	}
}

function getTriggerList(url,token,checktime,https_flag){
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
	getZabbixData(rpcid, url, token, "trigger.get", params, https_flag);
}

function updateTime(key){
	var token = JSON.parse(localStorage.getItem(key)).token;
	var https_flag = getHttpsFlag(key);
	var data = {
	token:token,
	checktime:parseInt((new Date)/1000),
	https:https_flag
	};
	var json_data = JSON.stringify(data);
	localStorage.setItem(key,json_data);
}

function refreshTriggerCount(){
	var one_counter = 0;
	var counter = 0;
	for( var key in localStorage ){
		if( key == "options" ){
			continue;
		}
		var token = JSON.parse(localStorage.getItem(key)).token;
		var checktime = JSON.parse(localStorage.getItem(key)).checktime;
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
	strTable += "<table id=main>";
	strTable += "<div id=logout><a href=# name='"+url+"'>Logout</a></div>";
	if( response.error ){
		strTable += "<div class=noconnection>Not Connected!</div>";
		outputError("Not Connected!");
	}else if( response.result == "" ){
		strTable += "<div class=nodata>No Trouble!</div>";
	}else{
		strTable += "<tr><th>Description</th><th>Time</th><th>Host</th>";
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
					var priority = "";
					switch (response.result[index][itemname]){
						case "0":
							priority = "unknown";
							break;
						case "1":
							priority = "information";
							break;
						case "2":
							priority = "warning";
							break;
						case "3":
							priority = "average";
							break;
						case "4":
							priority = "high";
							break;
						case "5":
							priority = "disaster";
							break;
					}
				}
			}
			var class_name = "old";
			if( unixtime >= JSON.parse(localStorage.getItem(url)).checktime ) {
				class_name = "new";
			}
			strTable += "<td class='" + class_name + " " + priority  + "'><a href=" + pageurl + " target=_blank ><span>Priority:" + priority + "</span>" + description + "</a></td><td class=" + class_name + ">" + time + "</td><td class=" + class_name + ">" + hostname + "</td>";
			strTable += "</tr>";
		}
	}
	strTable += "</table><br>";
	//document.getElementById("datatable").innerHTML = strTable;
	$("#datatable").fadeOut("normal",function(){
		$("#datatable").html(strTable);
		$("#datatable").fadeIn();
	//	htmlResize();
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
function getZabbixData(rpcid, url, authid, method, params, https_flag) { // "params"はJSON形式の文字列リテラルかJSONに変換可能なオブジェクト
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
				var str = "<table><div id=logout><a id=logout href=# onclick=Logout('"+url+"')>Logout</a></div>";
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
		popupNotification(msg);
	}
}

function getHttpsFlag(key){
	var https_flag = JSON.parse(localStorage.getItem(key)).https;
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
		if( key == "options" ){
			continue;
		}
		var token = JSON.parse(localStorage.getItem(key)).token;
		var checktime = JSON.parse(localStorage.getItem(key)).checktime;
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

function popupNotification(msg){
	if( localStorage.getItem("options") ){
		if( JSON.parse(localStorage.getItem("options")).notification == "On"){
			var notification = window.webkitNotifications.createNotification(
			"image/warning.png",
			"WARNING!!",
			msg
			);
			
			setTimeout(function(){
				notification.cancel();
			},1000*notification_rate);
			notification.show();
		}
	}
}
