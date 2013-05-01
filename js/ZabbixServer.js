var ZabbixServer = function(url,username,password,token,https) {
    this.url = url;
    this.username = username;
    this.password = password;
    this.token = token;
    this.https = https;
    this.new_trigger;
    this.checktime;
    this.login = function(){
        zabbix_api = new ZabbixAPI(this.makeAPIUrl(),username,password,token,null,null);
        result = zabbix_api.execAuth();
        if( /^error:/.exec(result) ){
            return false;
        }else{
            this.token = result
            return true;
        }
    };
    this.logout = function(){
    };
    this.checkTriggerCount = function(){
    };
    this.updateChecktime = function(){
    };
    this.getTriggerList = function(){
    };
    this.saveTolocalStorage = function(){
    };
    this.makeAPIUrl = function(){
        if(this.https){
            return("https://"+ this.url + "/api_jsonrpc.php");
        }else{
            return("http://"+ this.url + "/api_jsonrpc.php");
        }
    };
};

