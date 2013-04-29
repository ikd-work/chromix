describe("ZabbixAPI Class",function() {
    var api_url = "http://hostname/zabbix/api_jsonrpc.php";
    var username = "xxxxxx";
    var password = "xxxxxx";
    var token;
    var method;
    var params;

    beforeEach(function() {
        zabbix_api = new ZabbixAPI(api_url,username,password,null,null,null);
    });

    it("shold get token when execute user.authenticate successfuly", function() {
        console.log(zabbix_api.execAuth());
        expect(zabbix_api.execAuth()).toBeDefined();
    });
});
