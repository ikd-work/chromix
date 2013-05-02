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
    this.checkNewTriggerCount = function () {
    };
    this.updateChecktime = function () {
    };
    this.getTriggerList = function () {
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

