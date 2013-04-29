describe("Trigger", function() {
    var triggerid;
    var description;
    var priority = "1";
    var lastchange;
    var host;
    var comments;
    var error;
    var checktime = parseInt((new Date)/1000) - 1000;
    
    beforeEach(function() {
        trigger = new Trigger(triggerid,description,priority,lastchange,host,comments,error);
    });

    describe("New trigger", function() {
        beforeEach(function() {
            lastchange = parseInt((new Date)/1000); 
            trigger = new Trigger(triggerid,description,priority,lastchange,host,comments,error);
        });
        it("should get true from checkNew", function() {
            expect(trigger.checkNew(checktime)).toBeTruthy();
        });
    });
    describe("Old trigger", function() {
        beforeEach(function() {
            lastchange = parseInt((new Date)/1000) - 2000; 
            trigger = new Trigger(triggerid,description,priority,lastchange,host,comments,error);
        });
        it("should get false from checkNew", function() {
            expect(trigger.checkNew(checktime)).toBeFalsy();
        });
    });
});

