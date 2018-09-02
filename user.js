var kStyleStudent = 1;
var kTrendy = 2;
var kExpert = 3;
var kTrendSetter = 4;
var kFashionGuru = 5;
var kFashionPhenom = 6;
var kFashionKiller = 7;
var kStyleLord = 8;
var kFadstirGod = 9;
 
var kStyleStudentPoints = 0;
var kTrendyPoints = 300;
var kExpertPoints = 2000;
var kTrendSetterPoints = 5000;
var kFashionGuruPoints = 15000;
var kFashionPhenomPoints = 30000;
var kFashionKillerPoints = 60000;
var kStyleLord = 120000;
var kFadstirGod = 500000;
 
var kFollowerType = 1;
var kShareOutfitType = 2;
var kSatisfactoryOutfitType = 3;
var kExcellentOutfitType = 4;
 
////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
function LOG(str) {
    console.log("USER.JS =============== "+str);
}
 
/////////////// 
// OUTFIT.JS ========================= outfitStr: 'str'
function LOGV(str, val) {
    console.log("USER.JS =============== "+str + ": " + "'" + val + "'");
}
 
function USERPOINTSMAP() {
    return Parse.Object.extend("UserPointsMap");
}
 
function user_points_map_query_for_user_id(userId) {
    var query = new Parse.Query(USERPOINTSMAP());
    query.equalTo("userId", userId);
    return query;
}
 
////////////////////////////////////////////////////////////////
// functions
 
Parse.Cloud.define("sendPushToUser", function(request,response) {
    Parse.Cloud.useMasterKey();
    var userId = request.params.userId;
    var query = new Parse.Query(Parse.User);
    query.equalTo('objectId', userId);
     
    // Find devices associated with these users
    var pushQuery = new Parse.Query(Parse.Installation);
    // need to have users linked to installations
    //pushQuery.matchesQuery('user', query);
    pushQuery.equalTo('channels', 'user_mzWOWpD7J7'); // Set our channel
    Parse.Push.send({
        where: pushQuery,
        data: {
            aps: {
                alert: "Yo Tenz. Did you get this?",
                sound: ""
            }
        }
    }, {
        success: function () {
            response.success("Hello world!");
        },
        error: function (error) {
            response.error(error);
        }
    });
});
 
Parse.Cloud.beforeSave(Parse.User, function(request, response) {
    var user = request.object;
    console.log("called user' beforesave");
    Parse.Cloud.useMasterKey();
    if (user.isNew()) {
        // Setting up Facebook Graph API
        //      
         
        if (user.get('authData') && typeof user.get('authData') !== 'undefined') {
            // console.log("MASUP!");
//             console.log("authData : " + user.get('authData'));
//             console.log("!user.get('authData') = " + !user.get('authData'));
//             console.log("undefined " + typeof user.get('authData') === 'undefined');
            var facebookGraphAPIURL = 'https://graph.facebook.com/me';
            facebookGraphAPIURL = facebookGraphAPIURL + '?access_token=' + user.get('authData')['facebook']['access_token'];
 
//             console.log("user before save URL  " + facebookGraphAPIURL);
 
            facebookGraphCall(facebookGraphAPIURL, function(result) {
                if (result) {
                    //console.log("user before save result  " + JSON.stringify(result));
                    request.object.set('fbID', result['id']);
                    request.object.set('userFullName', result['name']);
 
                    if (result["username"]){
                        request.object.set('userName2', result['username']);
                    }
 
                    if (result['email']){
                        request.object.set('userEmail', result['email']);
                    }
                    if (result["location"]) {
                        request.object.set('userHometown', result["location"]["name"]);
                    }
 
                    if (result["bio"]) {
                        request.object.set('userDescription', result["bio"]);
                    }
 
                    if (result["gender"]) {
                        request.object.set('gender', result["gender"]);
                    }
                    if (result["birthday"]) {
                        var parts = result["birthday"].split('/');
                        var mydate = new Date(parts[2], parts[0] - 1, parts[1]); //please put attention to the month
                        request.object.set('userBirthday', mydate);
                    }
 
                    request.object.set('channels', ["user_" + user.id, "outfit_rate", "outfit_grade"]);
 
 
                    // console.log("user before save result  " + JSON.stringify(user));
 
                    response.success();
                } else {
                    response.success();
                }
            });
        } else {
            response.success();
        }
    } 
    else {
        var userName = user.get("username");
        LOGV("username", userName);
        var displayName = user.get("displayName");
        LOGV("displayName", displayName);
        if(userName && !displayName) {
            LOG("CHANGING DISPLAY NAME!");
            user.set("displayName", userName);
        }
         
        response.success();
    }
});
 
 
Parse.Cloud.job("testUserFacebook", function(request, status) {
    // Set up to modify user data
    Parse.Cloud.useMasterKey();
    var jsonResponse = {};
 
    //query semua moment yg ada facebook id nya user di taggedFriendsArray
    //kalo udah dapet, hapus fbid nya si user dari taggedFriendsArray di momen itu
    //tambahin PFUser si user ke taggedUsersArray
    var query = new Parse.Query(Parse.Object.extend("Moment"));
 
 
    query.equalTo("facebookIDArray", "560606827");
    query.find({
        success: function(results) {
            // The object was retrieved successfully.
            //console.log("Guh results count : " + results.length);
            for (i = 0; i < results.length; i++) {
                moment = results[i];
                if (moment) {
                    moment.remove("facebookIDArray", "560606827");
                    moment.addUnique("taggedUsersArray", Parse.User.current());
                    moment.save();
                    //console.log("Guhmoment " + moment.id);
                }
 
            }
            status.success("oke");
 
        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and description.
            //console.log("Error retrievinf moment : " + error);
            status.error("error");
        }
    });
});
 
function saveUserLevel(user, points, level) {
    user.set("level", level);
    user.set("levelPoints", points);
    user.save();
}
 
Parse.Cloud.define("updateUserLevel", function(request,response) {
    Parse.Cloud.useMasterKey();
    var userId = request.params.user_id;
    var User = Parse.Object.extend("User");
    var Activity = Parse.Object.extend("Activity");
    var query = new Parse.Query(User);
    query.equalTo("objectId", userId);
    LOG("=================================================");
    LOG("debug start: updateUser Level");
    var json_response = {};
    query.find({
        success: function(results) {
            if(results.length > 0) {
                var user = results[0];
                 
                var level = user.get("level");
                var levelPoints = user.get("levelPoints");
                LOGV("level", level);
                LOGV("levelPoints", levelPoints);
                if(level == undefined || levelPoints == undefined) {
                    LOG("NOTICE: one of two values is undefined1");
                    var gamificationPoints = user.get("gamificationScore");
                    if(!gamificationPoints) {
                        LOG("NOTICE: gamification score is undefined");
                        saveUserLevel(user, 0, kStyleStudent);
                    }
                    else {
                    LOG("NOTICE: saving level points as gamification score. Not leveling up...");
                        saveUserLevel(user, gamificationPoints, getLevelFromPoints(gamificationPoints));
                    }
                    LOG("debug end");
                    LOG("=================================================");
                    response.success("user saved. Level Points updated");
                }
                else { // has a level 
                    var levelFromPoints = getLevelFromPoints(levelPoints);
                    console.log("level From points: " + levelFromPoints);
                    if(level < levelFromPoints) { // level up!
                        var message = "User leveled up. Prev level: " + level + " | New Level: " + levelFromPoints;
                        console.log("Message: " + message);
                        saveUserLevel(user,  levelPoints, levelFromPoints);
                        json_response.message = message;
                        json_response.level = levelFromPoints;
                        json_response.leveledUp = 1;
                        console.log("SUCCESS! User leveled up");
                         
                        var rateActivity = new Activity();
                        var actString = "Reached level " + levelFromPoints + "!";
                        rateActivity.set('activityType', 10);
                        rateActivity.set('fromUser', request.user);
                        rateActivity.set('activityContent', actString);
                        rateActivity.save();
                    }
                    else {
                        json_response.message = "User is still at the same level. Not leveling up";
                    }
                    console.log("debug end");
                    console.log("=================================================");
                    response.success(json_response);
                }
            }
            else {
                console.log("debug end");
                console.log("=================================================");
                response.success("Success, no users found with the object Id");
            }
        }, error: function(error) {
            console.log("debug end");
            console.log("=================================================");
            response.error(jsonErrorResponse(error, "error getting user"));
        }
    });
});
 
function getLevelFromPoints(levelPoints) {
    if(levelPoints < 0) {
        return kStyleStudent;
    }
    if(levelPoints >= 0 && levelPoints < kTrendyPoints) {
        return kStyleStudent;
    }
    else if(levelPoints >= kTrendyPoints && levelPoints < kExpertPoints) {
        return kTrendy;
    }
    else if(levelPoints >= kExpertPoints && levelPoints < kTrendSetterPoints) {
        return kExpert;
    }
    else if(levelPoints >= kTrendSetterPoints && levelPoints < kFashionGuruPoints) {
        return kTrendSetter;
    }
    else if(levelPoints >= kFashionGuruPoints && levelPoints < kFashionPhenomPoints) {
        return kFashionGuru;
    }
    else if(levelPoints >= kFashionPhenomPoints && levelPoints < kFashionKillerPoints) {
        return kFashionPhenom;
    }
    else if(levelPoints >= kFashionKillerPoints && levelPoints < kStyleLord) {
        return kFashionKiller;
    }
    else if(levelPoints >= kStyleLord) {
        return kStyleLord;
    }
    return kFadstirGod;
}
 
/*
 'afterSave User'
 */
// Parse.Cloud.afterSave(Parse.User, function(request) {
//     var user = request.object;
// 
//     
//     
// 
// });
 
function facebookGraphCall(facebookGraphAPIURL, callback) {
    Parse.Cloud.httpRequest({
        url: facebookGraphAPIURL,
        headers: {
        },
        success: function(httpResponse) {
            callback(httpResponse.data);
        },
        error: function(httpResponse) {
            callback();
            console.error('Request failed with response code ' + httpResponse.status);
        }
    });
};
 
//
// This function requests a user points map for a certain user, makes 
// a request for data based on the type and data passed into params,
// if it finds a lack of a certain necessary field, it will update
// the user points and level, send a push notification, and update
// the user's level
Parse.Cloud.define("updateUserPointsMap", function(request, response) {
    Parse.Cloud.useMasterKey();
});
 
function getUserPointsMapsForType(type, userId){
    var query = user_points_map_query_for_user_id(userId);
}
 
function getPointMapInfoArrayForType(map, type) {
    if(!map) return undefined;
    if(type == kFollowerType) {
        return map.get("followers");
    }
    else if(type == kShareOutfitType) {
        return map.get("sharedOutfits");
    }
    else if(type == kSatisfactoryOutfitType) {
        return map.get("satisfactoryOutfits");
    }
    else if(type == kExcellentOutfitType) {
        return map.get("excellentOutfits");
    }
}