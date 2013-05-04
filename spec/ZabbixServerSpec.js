/*global describe,
        beforeEach,
        it,
        expect,
        ZabbixServer*/
describe("ZabbixServer Class", function () {
    'use strict';
    var url = "hostname/zabbix",
        username = "admin",
        password = "zabbix",
        token,
        https = false,
        new_trigger_num,
        checktime = 1325260400,
        zabbix_server;

    beforeEach(function () {
        zabbix_server = new ZabbixServer(url, username, password, token, https);
    });

    it("should get Zabbix Server API URL from makeAPIUrl function", function () {
        expect(zabbix_server.makeAPIUrl()).toMatch(/^http.*api_jsonrpc.php$/);
    });

    describe("Login", function () {
        it("should set token after login", function () {
            expect(zabbix_server.login()).toBeTruthy();
            expect(zabbix_server.token).toMatch(/^[0-9|a-f]{31}/);
        });
        it("login failure", function () {
            username = "hoge";
            zabbix_server = new ZabbixServer(url, username, password, token, https);
            expect(zabbix_server.login()).toBeFalsy();
        });

    });

    describe("Get Trigger Info", function () {
        beforeEach(function () {
            username = "admin";
            zabbix_server = new ZabbixServer(url, username, password, token, https);
            zabbix_server.login();
        });

        it("should get triggerlist", function () {
            expect(typeof(zabbix_server.getTriggerList())).toEqual("object");
        });
        it("should get trigger count num from checkNewTriggerCount", function () {
            zabbix_server.getTriggerList();
            zabbix_server.updateChecktime(checktime);
            expect(typeof(zabbix_server.checkNewTriggerCount(null))).toEqual("number");
        });
    });
});
