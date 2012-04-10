function getTab(){
	var tab_str = "<ul>"; 
	var count = 0;
	for( var key in localStorage ){
		if( sessionStorage.getItem("selected") == key ){
			tab_str += "<li id=tab" + count + " class=selected_tab >" + key + "</li>";
		}else{
			tab_str += "<li id=tab" + count + " class=tab >" + key + "</li>";
		}
		count++;
	}
	tab_str += "</ul>"
	$("#tab").html(tab_str);
	$("li.tab").click(function(){
		sessionStorage.setItem("selected",$(this).text());
		selectedTabView(sessionStorage.getItem("selected"));
	});
}

function updateTime(key){
	var token = JSON.parse(localStorage.getItem(key)).token;
	var data = {
	token:token,
	checktime:parseInt((new Date)/1000)
	};
	var json_data = JSON.stringify(data);
	localStorage.setItem(key,json_data);
}

function selectedTabView(selected_tab){
	for( var key in localStorage ){
		var token = JSON.parse(localStorage.getItem(key)).token;
		var checktime = JSON.parse(localStorage.getItem(key)).checktime;
		if( sessionStorage.getItem("selected") == null ){
			sessionStorage.setItem("selected",key);
			getTriggerList(key,token,checktime);
			getTab();
		}else if( sessionStorage.getItem("selected") == key ){    
			getTriggerList(key,token,checktime);
			getTab();
		}
	}
}


function getTriggerList(url,token,checktime){
	var rpcid = 1;
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
	getZabbixData(rpcid, url, token, "trigger.get", params);
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

function getAllTrigger(url, token, ckecktime) { // "params"はJSON形式の文字列リテラルかJSONに変換可能なオブジェクト
	var rpcid = 1;
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
	var api_url = "http://" + url + "/api_jsonrpc.php";
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
		error: function(response){  },
	});
	return(allTrigger);
}
function refreshTriggerCount(){
	var counter = 0;
	for( var key in localStorage ){
		var token = JSON.parse(localStorage.getItem(key)).token;
		var checktime = JSON.parse(localStorage.getItem(key)).checktime;
	//	counter += getTriggerCount(key,token,checktime);
		var alltrigger = getAllTrigger(key,token,checktime);
		for(var index in alltrigger.result) {
			for ( var itemname in alltrigger.result[index]){
				if( itemname == "lastchange"){
					if( checktime < alltrigger.result[index][itemname] ){
						counter++;
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
}
//API Access Authentication
function getAuth(url, user, password) {
	var params = {"user":user, "password":password};
	var authRequest = new Object();
		authRequest.params = params;
		authRequest.auth = null;
		authRequest.jsonrpc = '2.0';
		authRequest.id = 0;
		authRequest.method = 'user.authenticate';
	var authJsonRequest = JSON.stringify(authRequest);
	var authResult = new Object();
	var api_url = "http://" + url + "/api_jsonrpc.php";
	$.ajaxSetup({
		timeout: 2000
	});
	$.ajax({
		url: api_url,
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

// Access Zabbix API and Get Data
function getZabbixData(rpcid, url, authid, method, params) { // "params"はJSON形式の文字列リテラルかJSONに変換可能なオブジェクト
	var dataRequest = new Object();
	dataRequest.params = params;
	dataRequest.auth = authid;
	dataRequest.jsonrpc = '2.0';
	dataRequest.id = rpcid;
	dataRequest.method = method;
	var dataJsonRequest = JSON.stringify(dataRequest);
	var api_url = "http://" + url + "/api_jsonrpc.php";
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
			showResult(response,url);
		},
		error: function(response){
			outputError("Connection Error!");
			$("#datatable").fadeOut("normal",function(){
				var str = "<table><a href=# onclick=Logout('"+url+"')>Logout</a><br>";
				str += "<div class=noconnection>Not Connected!</div>";
				str += "</table><br>";
				$("#datatable").html(str);
				$("#datatable").fadeIn();
			});
		},
	});
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


// 取り出したデータをテーブルとして出力
function showResult(response,url){
	var strTable = "";
	strTable += "<table>";
	strTable += "<a href=# onclick=Logout('"+url+"')>Logout</a><br>";
	if( response.result == "" ){
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
					var pageurl = "http://" + url + "/events.php?triggerid=" + response.result[index][itemname];
				};
			}
			var class_name = "old";
			if( unixtime >= JSON.parse(localStorage.getItem(url)).checktime ) {
				class_name = "new";
			}
			strTable += "<td class=" + class_name + "><a href=" + pageurl + " target=_blank >" + description + "</a></td><td class=" + class_name + ">" + time + "</td><td class=" + class_name + ">" + hostname + "</td>";
			strTable += "</tr>";
		}
	}
	strTable += "</table><br>";
	//document.getElementById("datatable").innerHTML = strTable;
	$("#datatable").fadeOut("normal",function(){
		$("#datatable").html(strTable);
		$("#datatable").fadeIn();
	});
	updateTime(url);
	refreshTriggerCount();
	
}
