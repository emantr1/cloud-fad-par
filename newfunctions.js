/*This function updates the gamification score of a user*/
Parse.Cloud.define("updateGamificationScore", function(request, response) {
    Parse.Cloud.useMasterKey();
     
    var userId = request.params.userId;
    var addPoints = request.params.addPoints;
    var query = new Parse.Query(Parse.User);
    query.equalTo("objectId", userId);
    query.find().then(function(users) {
        if(users.length > 0) {
            var user = users[0];
            var gamificationPoints = user.get(GAMIFICATION_KEY);
            if(is_null_or_undefined(gamificationPoints)) {
                gamificationPoints = 0;
            }
            gamificationPoints = gamificationPoints + addPoints;
            user.set(GAMIFICATION_KEY, gamificationPoints);
            user.save().then(function(savedUser) {
                var info = {};
                info.message = "Success saving user high score";
                info.user = savedUser;
                response.success(info);
            });
        }
        else {
            response.error("no users with the user id " + userId + " found");
        }
    })
});

/*This function updates VS score of a user ---- need a savedGame equivalent of savedUser*/
Parse.Cloud.define("updateVSScore", function(request, response) {
    Parse.Cloud.useMasterKey();
     
    var gameId = request.params.gameId;
    var score = request.params.score;
    var column = request.params.column;
    var gameQuery = game_query();
    gameQuery.equalTo("objectId", gameId);
    gameQuery.find().then(function(games) {
        if(games.length > 0) {
            var game = games[0];
            if(is_null_or_undefined(column) || column < 0) {
                response.error("user score is less than zero or is null or undefined.")
                return;
            }
            game.set(GAME_SCORE_KEY, score);
            game.save().then(function(savedGame) {
                var info = {};
                info.message = "success saving fadstir outfit game average";
                info.game = savedGame;
                response.success(info);
            });
        }
        else {
            response.error("no games found with the gameID: " + gameId + ".");
        }

    })
});
