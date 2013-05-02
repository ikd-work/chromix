describe("ZabbixAPI Class",function() {
    var api_url = "http://hostname/zabbix/api_jsonrpc.php";
    var username = "xxxxx";
    var password = "xxxxx";
    var token;
    var method;
    var params;

    beforeEach(function() {
        zabbix_api = new ZabbixAPI(api_url,username,password,null,null,null);
    });

    it("should get token(32chars) when execute user.authenticate(execAuth) successfully", function() {
        console.log(zabbix_api.execAuth());
        token = zabbix_api.execAuth();
        expect(token).toMatch(/^[0-9|a-f]{31}/);
    });
    describe("trigger.get test", function() {
        it("should get trigger list when execute trigger.get successfully", function() {
        });
    });
    describe("hostgroup.get test", function() {
        it("should get hostgroup list when execute hostgroup.get successfully", function() {
        });
    });
});
