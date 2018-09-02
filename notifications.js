Parse.Cloud.define("updateSeenNotifications", function(request, response){
    var jsonResponse = {};
     
    Parse.Cloud.useMasterKey();
     
    var query = new Parse.Query(Parse.Object.extend("Activity"));
    query.include("toUserArray");
    query.equalTo("toUserArray",Parse.User.current());
    query.notEqualTo("userSeenArray",Parse.User.current());
    query.find({
      success: function(results) {
        // The object was retrieved successfully.
        var notif = null;
        for (i = 0; i < results.length; i++) {   
            notif = results[i];
            if(notif){
                notif.addUnique("userSeenArray",Parse.User.current());
                notif.save();
                 
            }
             
        }
        response.success(results);
         
      },
      error: function(object, error) {
        // The object was not retrieved successfully.
        // error is a Parse.Error with an error code and description.
        jsonResponse.status = 400;
        jsonResponse.error = error;
        response.error(jsonResponse);
        return;     
      }
    });
})