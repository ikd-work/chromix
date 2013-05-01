var ZabbixAPI = function(api_url,username,password,token,method,params){
    this.api_url = api_url;
    this.username = username;
    this.password = password;
    this.token = token;
    this.method = method;
    this.params = params;
    this.execAuth = function(){
        this.setMethod('user.authenticate');
        this.setParams({'user':this.username, 'password':this.password});
        var response = this.execAPI();
        console.log(response);
        if( response.error ) {
            return("error:[code]"+response.error.code+" [data]"+response.error.data+" [message]"+response.error.message);
        }else if( response.result ){
            return response.result;
        }
    };
    this.execAPI = function(){
        var result = new Object();
        $.ajaxSetup({
            timeout:2000
        });
        $.ajax({
            url: this.api_url,
            username: this.username,
            password: this.password,
            contentType: 'application/json-rpc',
            dataType: 'json',
            type: 'POST',
            processData: false,
            timeout: 2000,
            async: false,
            data: this.getRequestParams(),
            success: function(response){
                result = response;
            },
            error: function(response,status,errorThrown){
                result.result = 'Connection Error!';
            },
        });
        return(result);
    };
    this.setMethod = function(method){
        this.method = method;
    };
    this.setParams = function(params){
        this.params = params;
    };
    this.getRequestParams = function(){
        var requestParams = new Object();
        requestParams.params = this.params;
        requestParams.auth = this.token;
        requestParams.jsonrpc = '2.0';
        requestParams.id = 0;
        requestParams.method = this.method;
        return JSON.stringify(requestParams);
    };
};
