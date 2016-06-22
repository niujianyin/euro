var ajaxData = (function () {
  var pri = {};
  var app_key = "";
  var pub = {
    powerData: function (team1Id, team2Id, callback) { //球队整体实力图
      var hid = team1Id,
        aid = team2Id;
      var dataUrl = 'http://odds.sports.sina.com.cn/uefa/matchModelStats/?hid=' + hid + '&aid=' + aid + '&format=json'
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        cache: true,
        jsonpCallback: 'powerData_team1Id_' + team1Id + 'team2Id_' + team2Id,
        data: {},
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(data.result.data)
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function (data) {
          util.log("本地请求失败!")
        })
    },
    mvpData: function (matchId, callback) {
      var dataUrl = 'http://odds.sports.sina.com.cn/odds/uefa/playerModelStats/?id=' + matchId + '&format=json';
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'mvpData_' + matchId,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    historyVs: function (team1, team2, limit, callback) {
      // var team1 = team1;
      // var team2 = team2;
      var limit = limit;
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3633771828&%20_sport_t_=Odds&_sport_a_=teamRecentMatches&team1=' + team1 + '&team2=' + team2 + '&limit=' + limit;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'historyVs_team1_'+team1+'team2_'+team2+'limit_'+limit,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    HnearVs: function (team1, limit, callback) {
      // var limit = limit;
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3633771828&%20_sport_t_=Odds&_sport_a_=teamRecentMatches&team1=' + team1 + '&limit=' + limit;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'HnearVs_'+team1,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    GnearVs: function (team1, limit, callback) {
      // var limit = limit;
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3633771828&%20_sport_t_=Odds&_sport_a_=teamRecentMatches&team1=' + team1 + '&limit=' + limit;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'GnearVs_'+team1,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    futureGame: function (team1, callback) {
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3633771828&_sport_t_=livecast&_sport_a_=getTeamPreMatches&id=' + team1;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'futureGame_'+team1,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    news: function (team1, callback) {
      // var team1 = team1;
      var dataUrl = 'http://platform.sina.com.cn/sports_client/news?app_key=3633771828&team_id=' + team1 + '&level=1,2,3&news_type=1,2,3&len=5&fields=title,url,pub_time';
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'news_'+team1,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    // 欧赔
    getEurope: function (matchId, callback) {
      // var matchId = matchId || '3453592';
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3979320659&_sport_t_=Odds&_sport_a_=euroIniNewData&id=' + matchId;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'euroIniNewData_'+matchId,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    getEuropeSimple: function (matchId, bid, callback) {
      // var matchId = matchId ;
      // var bid = bid;
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3979320659&_sport_t_=Odds&_sport_a_=euroMakerDataByMatch&id=' + matchId + '&bid=' + bid;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'euroMakerDataByMatch_'+matchId,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    // 亚赔
    getAsia: function (matchId, callback) {
      var matchId = matchId || '3453592';
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3979320659&_sport_t_=Odds&_sport_a_=AsiaIniNewData&id=' + matchId;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'AsiaIniNewData_'+matchId,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    getAsiaSimple: function (matchId, bid, callback) {
      var matchId = matchId;
      var bid = bid;
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3979320659&_sport_t_=Odds&_sport_a_=asiaMakerDataByMatch&id=' + matchId + '&bid=' + bid;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'asiaMakerDataByMatch_'+matchId,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    }
  };
  return pub;
})();



