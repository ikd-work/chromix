function getTab(){
    var tab_str = ""; 
    var count = 0;
    for( var key in localStorage ){
      tab_str += "<div id=tab" + count + " class=tab onclick=changeTab()>" + key + "</div>";
      count++;
    }
    $("#tab").html(tab_str);
}

function changeTab(){
  alert($(this).attr('id'));
  sessionStorage.setItem("selected",$(this).text());
}
function getTriggerList(url,token,checktime){
    var rpcid = 1;
    var filter = new Object();
        filter.status = 0;
        //filter.value = 1;
    var params = new Object();
        params.output = "extend";
        params.expandData = 1;
        params.limit = 100;
        params.filter = filter;
   // $("#server_url").text(url);
    getZabbixData(rpcid, url, token, "trigger.get", params);
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
    for(var index in response.result) {
        strTable += "<tr><td>";
        for ( var itemname in response.result[index]){
            if (itemname == "hostname" || itemname == "description") {
               strTable += response.result[index][itemname];
               strTable += "</td><td>";
            };
             
        }
        strTable += "</td></tr>";
    }
    strTable += "</table><br>";
    //document.getElementById("datatable").innerHTML = strTable;
    $("#datatable").html(strTable);
    getTab();
//    $("#server_url").text(url);
}
