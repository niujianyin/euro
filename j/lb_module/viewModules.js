var viewModules=(function(){
  var pub = {
  //筛选数据
  chooseAndSet: function (op) {
    var returnData = null;
    var newsOp = {};
    $.extend(true, newsOp, op);
    newsOp.data.data = newsOp.data.data.slice(0, op.num);
    if (op.radioName != '全部') {
      if (newsOp.tabName == '总') {
        returnData = $.grep(newsOp.data.data, function (n, i) {
          return n.LeagueType_cn == newsOp.radioName;
        });
      } else if (newsOp.tabName == "主") {
        returnData = $.grep(newsOp.data.data, function (n, i) {
          return n.LeagueType_cn == newsOp.radioName && n.Team1 == newsOp.data.Team1;
        });
      } else if (newsOp.tabName == "客") {
        returnData = $.grep(newsOp.data.data, function (n, i) {
          return n.LeagueType_cn == newsOp.radioName && n.Team1 != newsOp.data.Team1;
        });
      }
    } else {
      if (newsOp.tabName == '总') {
        returnData = newsOp.data.data;
      } else if (newsOp.tabName == "主") {
        returnData = $.grep(newsOp.data.data, function (n, i) {
          return n.Team1 == newsOp.data.Team1;
        });
      } else if (newsOp.tabName == "客") {
        returnData = $.grep(newsOp.data.data, function (n, i) {
          return n.Team1 != newsOp.data.Team1;
        });
      }
    }
    ;
    newsOp.data.data = returnData;
    newsOp.data.Team1Draw = $.grep(returnData, function (n, i) {
      return n.win_lose == '平';
    }).length;
    newsOp.data.Team1Lose = $.grep(returnData, function (n, i) {
      return n.win_lose == '负';
    }).length;
    newsOp.data.Team1Win = $.grep(returnData, function (n, i) {
      return n.win_lose == '胜';
    }).length;
    newsOp.data.draw_percent = parseInt((newsOp.data.Team1Draw / newsOp.data.data.length) * 100) || 0;
    newsOp.data.lose_percent = parseInt((newsOp.data.Team1Lose / newsOp.data.data.length) * 100) || 0;
    newsOp.data.win_percent = parseInt((newsOp.data.Team1Win / newsOp.data.data.length) * 100) || 0;
    return newsOp.data;
  }
};
return pub;
})();
