/*global ZabbixAPI*/
var ZabbixServer = function (url, username, password, token, https) {
    'use strict';
    this.url = url;
    this.username = username;
    this.password = password;
    this.token = token;
    this.https = https;
    this.new_trigger_num;
    this.checktime;
    this.triggerlist = new Array();
    this.login = function () {
        var response, result, zabbix_api;
        zabbix_api = new ZabbixAPI(this.makeAPIUrl(), username, password, token, null, null);
        response = zabbix_api.execAuth();
        if (/^error:/.exec(response)) {
            result = false;
        } else {
            this.token = response;
            result = true;
        }
        return result;
    };
    this.logout = function () {
    };
    this.checkNewTriggerCount = function (triggerlist) {
        var counter = 0;
        if (triggerlist) {
            this.triggerlist = triggerlist;
        }
        for(var i in this.triggerlist) {
            if (this.triggerlist[i].checkNew(this.checktime)) {
                counter += 1;
            }
        }
        return counter;
    };
    this.updateChecktime = function (checktime) {
        this.checktime = checktime;
        return null;
    };
    this.getTriggerList = function () {
        var params = new Object();
            params.output = "all";
            params.expandData = 1;
            params.expandDescription = 1;
            params.limit = 100;
            params.monitored = 1;
            params.sortfield = "lastchange";
            params.sortorder = "DESC";
            params.filter = {"status": 0, "value": 1};
        var response, result, zabbix_api;
        zabbix_api = new ZabbixAPI(this.makeAPIUrl(), this.username, this.password, this.token, "trigger.get", params);
        response = zabbix_api.execAPI();
        if (response.error) {
            /* Error */
        } else {
            for (var index in response.result) {
                var host = response.result[index]["host"];
                var description = response.result[index]["description"];
                var lastchange = response.result[index]["lastchange"];
                var triggerid = response.result[index]["triggerid"];
                var priority = response.result[index]["priority"];
                var comments = response.result[index]["comments"];
                var error = response.result[index]["error"];
                trigger = new Trigger(triggerid, description, priority, lastchange, host, comments, error);
                this.triggerlist.push(trigger);
            }
        }
        return this.triggerlist;
    };
    this.saveTolocalStorage = function () {
    };
    this.makeAPIUrl = function () {
        var result;
        if (this.https) {
            result = "https://" + this.url + "/api_jsonrpc.php";
        } else {
            result = "http://" + this.url + "/api_jsonrpc.php";
        }
        return result;
    };
};

