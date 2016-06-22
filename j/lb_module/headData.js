var headData = (function () {
  var pri = {};
  var pub = {};
  pub.set = function (matchId, callback) {
    var dataUrl = 'http://odds.sports.sina.com.cn/liveodds/getMatchInfo?m_id=' + matchId + '&format=json';
    var writeTab = '<li class="d_h_tabCurrent"><a href="//odds.sports.sina.com.cn/uefa/base/?m_id=' + matchId + '">数据分析</a></li>' +
      '<li><a href="//odds.sports.sina.com.cn/uefa/europe/?m_id=' + matchId + '">欧洲赔率</a></li>' +
      '<li><a href="//odds.sports.sina.com.cn/uefa/asia/?m_id=' + matchId + '">亚洲盘口</a></li>';
    $(".d_h_tabBox ul").html(writeTab);
    $.ajax({
      url: dataUrl,
      dataType: 'jsonp',
      data: {},
      cache: true,
      jsonpCallback: 'getMatchInfo_'+matchId,
      type: "get"
    }).done(function (data) {
      var result = data.result;
      var status = result && result.status;
      if (status && status.code == "0") {
        //测试数据
        // result.data.distance_2_cur = '13000';
        // result.data.status = '2';

        var dom_d_h_tabBox = $(".d_h_tabBox");
        if ($("#i_watchData")[0]) {
          dom_d_h_tabBox.find('li').eq(0).addClass('d_h_tabCurrent').siblings('li').removeClass('d_h_tabCurrent');
        } else if ($('#i_europeData')[0]) {
          dom_d_h_tabBox.find('li').eq(1).addClass('d_h_tabCurrent').siblings('li').removeClass('d_h_tabCurrent');
        } else if ($('#i_asiaData')[0]) {
          dom_d_h_tabBox.find('li').eq(2).addClass('d_h_tabCurrent').siblings('li').removeClass('d_h_tabCurrent');
        }
        template.helper("distance", function (distance_2_cur, status) {
          distance_2_cur = result.data.distance_2_cur;
          status = result.data.status;
          if (status == "3" || status == "2") {
            return '<em>' + result.data.Score1 + '</em><span>vs</span><em>' + result.data.Score2 + '</em>';
          } else if (status == "1") {
            if (distance_2_cur <= 1440 && distance_2_cur > 60) {
              var dH = (distance_2_cur - 0) / 60;
              return '(距离比赛还有' + parseInt(dH) + '小时)';
            } else if (distance_2_cur > 1440) {
              var dD = (distance_2_cur - 0) / 1440;
              return '(距离比赛还有' + parseInt(dD) + '天)';
            } else if (distance_2_cur < 60) {
              return '(距离比赛还有' + distance_2_cur + '分钟)';
            }
          }
        });
        var html = template('temp_header', result.data);
        $(".d_headerVsBox")[0].innerHTML = html;

        callback(result.data);
      } else {
        util.log("服务器请求失败!");
      }
    })

  };
  return pub;
})();
