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
    $.ajax({
        url: api_url,
        contentType: 'application/json-rpc',
        dataType: 'json',
        type: 'POST',
        processData: false,
        async: false, // 認証が終わらないと次の処理ができないので、ここは同期通信に。
        data: authJsonRequest,
        success: function(response){
            authResult = response;
        },
        error: function(){ alert("failed"); },
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
        success: function(response){
            showResult(response,url);
        },
        error: function(response){ alert("failed"); },
    });
    //return dataResult;
}


// 取り出したデータをテーブルとして出力
function showResult(response,url){
	var strTable = "";
	strTable += "<table>";
	if( response.result == null ){
		strTable += "No Event!";
	}else{
		strTable += "<tr><th>Description</th><th>Time</th><th>Host</th>";
		for(var index in response.result) {
			strTable += "<tr>";
			for ( var itemname in response.result[index]){
				if (itemname == "hostname" || itemname == "description") {
					strTable += "<td>" + response.result[index][itemname];
					strTable += "</td>";
				}else if(itemname == "lastchange"){
					var TZ = +9;
					var unixtime = response.result[index][itemname];
					strTable += "<td>" + unixtimeToDate(parseInt(response.result[index][itemname]),+9);
					strTable += "</td>";
				};
			}
			strTable += "</tr>";
		}
	}
	strTable += "</table><br>";
	//document.getElementById("datatable").innerHTML = strTable;
	$("#datatable").fadeOut("normal",function(){
		$("#datatable").html(strTable);
		$("#datatable").fadeIn();
	});
	
}
