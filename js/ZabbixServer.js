var ZabbixServer = function(url,username,password,token,https) {
    this.url = url;
    this.username = username;
    this.password = password;
    this.token = token;
    this.https = https;
    this.new_trigger;
    this.checktime;
    this.login = function(){
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
};

