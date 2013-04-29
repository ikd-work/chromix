var Trigger = function(triggerid,description,priority,lastchange,host,comments,error) {
    this.triggerid = triggerid;
    this.description = description;
    this.priority = priority;
    this.lastchange = lastchange;
    this.host = host;
    this.comments = comments;
    this.error = error;
    this.checkNew = function(checktime){
        if( lastchange >= checktime ){
            return true;
        }else{
            return false;
        }
    };
};

