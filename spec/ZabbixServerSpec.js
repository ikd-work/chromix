describe("ZabbixServer Class",function() {
    var url = "hostname/zabbix";
    var username = "xxxxxx";
    var password = "xxxxxx";
    var token;
    var https = false;
    var new_trigger;
    var checktime;
    var zabbix_server;

    beforeEach(function() {
        zabbix_server = new ZabbixServer(url,username,password,token,https);
    });

    it("should get Zabbix Server API URL from makeAPIUrl function", function() {
        expect(zabbix_server.makeAPIUrl()).toMatch(/^http.*api_jsonrpc.php$/);
    });

    describe("Login", function() {
        it("should set token after login", function(){
            expect(zabbix_server.login()).toBeTruthy();
            expect(zabbix_server.token).toMatch(/^[0-9|a-f]{31}/);
        });
        it("login failure", function() {
            username = "hoge";
            zabbix_server = new ZabbixServer(url,username,password,token,https);
            expect(zabbix_server.login()).toBeFalsy();
        });

    });
});
