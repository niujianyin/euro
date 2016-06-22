(function () {
  var pangeInfo = null;//对战信息
  var historyIno = null;
  var matchId = util.getQueryString("m_id") || 3453592;
  var chartsOp = {};
  var curTheme = {
    color: [
      '#62e5b5', '#72c4e3', '#99d2dd', '#88b0bb',
      '#1c7099', '#038cc4', '#75abd0', '#afd6dd'
    ]
  };
  var pieTheme = {
    color: [
      '#e04f5c', '#8dcbd8', '#46556d', '#fff'
    ]
  }
  template.helper('wordList', function (data) {
    if (!!data.length) {
      var str = "";
      for (var i = 0, len = data.length - 1; i < len; i++) {
        str += ' ' + data[i].win_lose + ' /';
      }
      str += ' ' + data[data.length - 1].win_lose;
      return str;

    } else {
      return "无"
    }

  });
  // 头部插入
  headData.set(matchId, function (teamInfo) {
    // 购买小炮预测 
    payforGun(teamInfo);
    pangeInfo = teamInfo;
    var team1Id = teamInfo.Team1Id;
    var team2Id = teamInfo.Team2Id;
    // ##############################实力图表引入#########################################
    ajaxData.powerData(team1Id, team2Id, function (data) {
      chartsOp.teamAll = {
        domBox: $(".d_l1_left dd")[0],
        data: data,
        theme: curTheme,
        other: {
          hname: teamInfo.Team1,
          gname: teamInfo.Team2
        }
      };
      setCharts.teamRadar(chartsOp.teamAll);
    });
    ajaxData.mvpData(teamInfo.livecast_id, function (data) {
      chartsOp.mvp = {
        domBox: $(".d_l1_right dd")[0],
        data: data,
        theme: curTheme,
        other: {
          hname: teamInfo.Team1,
          gname: teamInfo.Team2
        }
      };
      setCharts.playerRadar(chartsOp.mvp);
      var mvpHtml = '<div class="d_l1_mvp">' + teamInfo.Team1 + '- <span>' + data.h_player + '</span></div>' +
        '         <div class="d_l1_mvp">' + teamInfo.Team2 + '- <span>' + data.a_player + '</span></div>';
      $(".d_l1_mvpBox").html(mvpHtml);

    });
    // ##############################历史交战记录#########################################
    //历史交战记录
    ajaxData.historyVs(team1Id, team2Id, 10, function (data) {
      var historyIno = data;
      var html = template('temp_histroyVS', data);
      $("#d_historyBox")[0].innerHTML = html;
      var chooseHtml = template('temp_chooseHistory', data);
      $(".d_l2_checkBoxContainer")[0].innerHTML = chooseHtml;
      var writeHtml = '';
      var j = 0;
      for (var i = 0; i < data.count; i++) {
        j++;
        writeHtml += '<option value="' + j + '">' + j + '</option>';
      }
      $(".d_l2_select").html(writeHtml).find('option:last').attr("selected", "selected");
      if(!!!data.count){
          $(".d_line2Box").hide();
      }
    });
    // ##############################近期战绩#########################################
    ajaxData.HnearVs(team1Id, 10, function (data) {
      var newsData = null;
      var chartsOp = null;
      window.data_homeNear = data;
      var nearHvs = data_homeNear;

      var op = {
        data: nearHvs,//整体data
        num: 10,
        tabName: '总',
        radioName: '全部'
      };
      newsData = viewModules.chooseAndSet(op);

      var html = template('temp_HnearVs', newsData);
      $("#d_HnearVs")[0].innerHTML = html;
      // 插入图表
      chartsOp = {
        domBox: $(".d_l3_leftCanvas")[0],
        data: newsData,
        theme: pieTheme
      };
      setCharts.nearState(chartsOp);
      var chooseHtml = template('temp_chooseHnear', data);
      $("#d_chooseHnear")[0].innerHTML = chooseHtml;
      var writeHtml = data.Team1 + '近期战绩&nbsp;<select name="" >';
      var j = 0;
      for (var i = 0; i < data.count; i++) {
        j++;
        writeHtml += '<option value="' + j + '">' + j + '</option>';
      }
      writeHtml += '</select> 场'
      $("#d_l3_selectH").html(writeHtml).find('option:last').attr("selected", "selected");

    });
    ajaxData.GnearVs(team2Id, 10, function (data) {
      window.data_guestNear = data;
      var newsData = null;
      var chartsOp = null;
      var nearHvs = data_guestNear;

      var op = {
        data: nearHvs,//整体data
        num: 10,
        tabName: '总',
        radioName: '全部'
      };
      newsData = viewModules.chooseAndSet(op);

      var html = template('temp_GnearVs', newsData);
      $("#d_GnearVs")[0].innerHTML = html;
      // 插入图表
      chartsOp = {
        domBox: $(".d_l3_rightCanvas")[0],
        data: newsData,
        theme: pieTheme
      };
      setCharts.nearState(chartsOp);
      var chooseHtml = template('temp_chooseGnear', data);
      $("#d_chooseGnear")[0].innerHTML = chooseHtml;
      var writeHtml = data.Team1 + '近期战绩&nbsp;<select name="" >';
      var j = 0;
      for (var i = 0; i < data.count; i++) {
        j++;
        writeHtml += '<option value="' + j + '">' + j + '</option>';
      }
      writeHtml += '</select> 场'
      $("#d_l3_selectG").html(writeHtml).find('option:last').attr("selected", "selected");
    });
    // ##############################未来赛事#########################################
    // team1Id
    ajaxData.futureGame(team1Id, function (data) {
      template.helper("colorCup", function (cupId) {
      });
      template.helper("distance", function (str) {
        str = str.replace(/-/g, '/');
        var lb_date = new Date(str);
        var lb_time = lb_date.getTime();
        var lb_distance = lb_time - $.now();
        return parseInt(lb_distance / 86400000);
      });
      var html = template('temp_Hfuture', data);
      //$("#d_Hfuture")[0].innerHTML = html;
      $("#d_Hfuture").html(html);
    });
    ajaxData.futureGame(team2Id, function (data) {
      template.helper("colorCup", function (cupId) {
      });
      template.helper("distance", function (str) {
        str = str.replace(/-/g, '/');
        var lb_date = new Date(str);
        var lb_time = lb_date.getTime();
        var lb_distance = lb_time - $.now();
        return parseInt(lb_distance / 86400000);
      });
      var html = template('temp_Gfuture', data);
      //$("#d_Gfuture")[0].innerHTML = html;
      $("#d_Gfuture").html(html);
    });
    // ##############################相关新闻#########################################
    ajaxData.news(pangeInfo.Team1Id, function (data) {
      template.helper("teamName", function () {
        return teamInfo.Team1;
      });
      var html = template('temp_newsHome', data);
      $(".d_l5_newsHome")[0].innerHTML = html;
    });
    ajaxData.news(pangeInfo.Team2Id, function (data) {
      template.helper("teamName", function () {
        return teamInfo.Team2;
      });
      var html = template('temp_newsGuest', data);
      $(".d_l5_newsGuest")[0].innerHTML = html;
    });

  });
  // ##############################交互事件#########################################
  // 历史交战记录
  $(".d_line2Box").on('click', '.d_l2_checkBoxContainer input', function () {
    var classEnd = this.value;
    $(".d_l2_dataType").parents('tr').hide();
    $(".d_l2_dataType" + classEnd).parents('tr').show();
  }).on('change', '.d_l2_select ', function () {
    var limitNum = this.value;
    ajaxData.historyVs(pangeInfo.Team1Id, pangeInfo.Team2Id, limitNum, function (data) {
      var html = template('temp_histroyVS', data);
      $("#d_historyBox")[0].innerHTML = html;
      $(".d_l2_checkBoxContainer input").removeAttr('checked');
    });
  });
  // 近期战绩
  //H

  $(".d_l3_homeBox").on('click', '#d_chooseHnear input', function () {
    var newsData = null;
    var chartsOp = null;
    var nearHvs = data_homeNear;
    var op = {
      data: nearHvs,//整体data
      num: $("#d_l3_selectH").find('select').val(),
      tabName: $("#d_l3L_tab").find('.d_l3_tabCurrent').text(),
      radioName: $(this).next('label').text()
    };
    newsData = viewModules.chooseAndSet(op);
    var html = template('temp_HnearVs', newsData);
    $("#d_HnearVs")[0].innerHTML = html;
    // 插入图表
    chartsOp = {
      domBox: $(".d_l3_leftCanvas")[0],
      data: newsData,
      theme: pieTheme
    };
    setCharts.nearState(chartsOp);

  }).on('change', '#d_l3_selectH select ', function () {
    var newsData = null;
    var chartsOp = null;
    var nearHvs = data_homeNear;
    var op = {
      data: nearHvs,//整体data
      num: this.value,
      tabName: $("#d_l3L_tab").find('.d_l3_tabCurrent').text(),
      radioName: $("#d_chooseHnear").find('input:radio:checked').next('label').text()
    };
    newsData = viewModules.chooseAndSet(op);
    var html = template('temp_HnearVs', newsData);
    $("#d_HnearVs")[0].innerHTML = html;
    // 插入图表
    chartsOp = {
      domBox: $(".d_l3_leftCanvas")[0],
      data: newsData,
      theme: pieTheme
    };
    setCharts.nearState(chartsOp);

  }).on('click', '#d_l3L_tab li', function () {
    $(this).addClass('d_l3_tabCurrent').siblings('li').removeClass('d_l3_tabCurrent');
    var newsData = null;
    var chartsOp = null;
    var nearHvs = data_homeNear;
    var op = {
      data: nearHvs,//整体data
      num: $("#d_l3_selectH").find('select').val(),
      tabName: $(this).text(),
      radioName: $("#d_chooseHnear").find('input:radio:checked').next('label').text()
    };
    newsData = viewModules.chooseAndSet(op);
    var html = template('temp_HnearVs', newsData);
    $("#d_HnearVs")[0].innerHTML = html;
    // 插入图表
    chartsOp = {
      domBox: $(".d_l3_leftCanvas")[0],
      data: newsData,
      theme: pieTheme
    };
    setCharts.nearState(chartsOp);

  });
  //G
  $(".d_l3_guestBox").on('click', '#d_chooseGnear input', function () {
    var newsData = null;
    var chartsOp = null;
    var nearHvs = data_guestNear;
    var op = {
      data: nearHvs,//整体data
      num: $("#d_l3_selectG").find('select').val(),
      tabName: $("#d_l3R_tap").find('.d_l3_tabCurrent').text(),
      radioName: $(this).next('label').text()
    };
    newsData = viewModules.chooseAndSet(op);
    var html = template('temp_GnearVs', newsData);
    $("#d_GnearVs")[0].innerHTML = html;
    // 插入图表
    chartsOp = {
      domBox: $(".d_l3_rightCanvas")[0],
      data: newsData,
      theme: pieTheme
    };
    setCharts.nearState(chartsOp);
  }).on('change', '#d_l3_selectG select ', function () {
    var newsData = null;
    var chartsOp = null;
    var nearHvs = data_guestNear;
    var op = {
      data: nearHvs,//整体data
      num: this.value,
      tabName: $("#d_l3R_tap").find('.d_l3_tabCurrent').text(),
      radioName: $("#d_chooseGnear").find('input:radio:checked').next('label').text()
    };
    newsData = viewModules.chooseAndSet(op);
    var html = template('temp_GnearVs', newsData);
    $("#d_GnearVs")[0].innerHTML = html;
    // 插入图表
    chartsOp = {
      domBox: $(".d_l3_rightCanvas")[0],
      data: newsData,
      theme: pieTheme
    };
    setCharts.nearState(chartsOp);
  }).on('click', '#d_l3R_tap li', function () {
    $(this).addClass('d_l3_tabCurrent').siblings('li').removeClass('d_l3_tabCurrent');
    var newsData = null;
    var chartsOp = null;
    var nearHvs = data_guestNear;
    var op = {
      data: nearHvs,//整体data
      num: $("#d_l3_selectG").find('select').val(),
      tabName: $(this).text(),
      radioName: $("#d_chooseGnear").find('input:radio:checked').next('label').text()
    };
    newsData = viewModules.chooseAndSet(op);
    var html = template('temp_GnearVs', newsData);
    $("#d_GnearVs")[0].innerHTML = html;
    // 插入图表
    chartsOp = {
      domBox: $(".d_l3_rightCanvas")[0],
      data: newsData,
      theme: pieTheme
    };
    setCharts.nearState(chartsOp);
  });
})();



