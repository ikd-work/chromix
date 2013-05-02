/*global describe,
        beforeEach,
        it,
        expect,
        ZabbixServer*/
describe("ZabbixServer Class", function () {
    'use strict';
    var url = "hostname/zabbix",
        username = "xxxxxx",
        password = "xxxxx",
        token,
        https = false,
        new_trigger_num,
        checktime,
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

    describe("checkNewTriggerCount", function () {
        it("should get trigger count num", function () {
            expect(zabbix_server.checkNewTriggerCount()).toBe(Number);
        });
    });
});
