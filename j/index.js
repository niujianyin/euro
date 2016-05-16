/*
* module name：index.js
* author：niujy
* date：2016年05月13日18:02:56
*/

//全站级脚本的调用入口模块
udvDefine(function(require,exports,module){
  var matchSlider = require("matchSlider");//首屏比赛条  暂时用这个 
  // var matchbar = require("matchbar");//首屏比赛条  有数据后修改
  var choicedate = require("choicedate");//选择日期
  var purchase = require("purchase");//购买小炮预测
  var echarts = require("echarts");//实力分析 交战历史图表
})


// 比赛滚动图
udvDefine("matchSlider",function(require,exports,module){
  (function($){
    var $match = $("#match"), $list = $("#match_list"), $tmp = $("#match_list_tmp");
    var html = template('match_list_tmp', {});
    $list[0].innerHTML = html;

    var ScrollPic = require("ScrollPic");
    var scrollObj = new ScrollPic();
    scrollObj.scrollContId = "match_list";
    scrollObj.arrLeftId = "match_pre";
    scrollObj.arrRightId = "match_next";
    scrollObj.dotListId = "";
    scrollObj.pageWidth = 978;
    scrollObj.frameWidth = 978;
    scrollObj.upright = false;
    scrollObj.speed = 20;
    scrollObj.space = 20;
    scrollObj.autoPlay = false;
    scrollObj.autoPlayTime = 2;
    scrollObj.circularly = false;
    scrollObj.initialize();

    document.getElementById('match_pre').onclick = function(){
      scrollObj.pre();
      return false;
    }
    document.getElementById('match_next').onclick = function(){
      scrollObj.next();
      return false;
    }
    module.exports = scrollObj;
  })(jQuery);
})

// 首屏比赛条
udvDefine("matchbar",function(require,exports,module){
  (function($){
    // 比赛展示数据
    var matchData = {};
    /**
     *jQuery对象
     *$match 外层容器（包含左右点击滚动区域）
     *$list 滚动区域容器
     */ 
    var $match = $("#match"), $list = $("#match_list"), $tmp = $("#match_list_tmp");
    // 定时器构造器
    var timeLoader = function(options) {
      var self = this;
      self.inited = false;
      self.isReflash = true;
      self.options = self._setOptions(options)
    };
    timeLoader.prototype = {
      init: function() {
        this._init()
      },
      _init: function() {
        var self = this;
        self.inited = true;
        self._getData()
      },
      _setOptions: function(options) {
        var defaults = this.defaults = {
          url: '',
          param: '',
          callback: function(){},
          callbackName: 'jsonp',
          interval: 0,
          beforeLoad: function() {},
          loaded: function(data) {},
          error: function(error) {}
        };
        return util.extend(defaults, options, true)
      },
      _getData: function() {
        var self = this;
        var opt = self.options;
        var url = opt.url;
        var param = opt.param;
        function intetval() {
          if (opt.interval > 0) {
            self.setTimeout = null;
            self.setTimeout = setTimeout(function() {
              self._getData()
            }, opt.interval)
          }
        }
        function request() {
          util.jsonp(url, callback, callbackName);
          intetval()
        }
        if (self.isReflash) {
          opt.beforeLoad();
          request()
        } else {
          intetval()
        }
      },
      reflash: function(b) {
        this.isReflash = b
      }
    };
    /**
     * 定时器实例
     * 1分钟（60 * 1000）请求一次接口
     */ 
    var MatchLoader = new timeLoader({
      url: 'http://sports.sina.com.cn/iframe/js/2014/live.js',
      param: '',
      interval: 60 * 1000,
      callback: function(result){
        // 处理数据
        MatchLoader.data = MatchLoader.getSortData(result);
        // 渲染数据
        MatchLoader.render();
      },
      callbackName: 'sports_livecast_hot_list',
      interval: 0
    });
    MatchLoader.getSortData = function(result){
      var self = this;
      matchData = result;
      return result;
    }
    MatchLoader.render = function() {
      var self = this;
      var render = doT.template(self.dom.matchTmpl);
      var html = render(matchData);

      if (self.slideObj) {
        self.slideObj.lDiv01.innerHTML = html;
        if( self.matchIdChange ){
          self.matchIdChange = false;
          var $match_item = $mrms.find(".mrms_item"),
            match_duing = DC.byId("match_duing"),
            match_prev = DC.byId("match_prev");
          var idx = 0;
            if( match_duing ){
              idx = $match_item.index( $(match_duing) );
            } else if( match_prev ) {
              idx = $match_item.index( $(match_prev) );
            } else {
              idx = 1;
            }
          var page = Math.floor(idx/5);

          // 滚动到正在直播第一页
          if( page == 0 ){
            $mrms.scrollLeft(0);
          } else {
            self.slideObj.pageTo(page);
          }
        }
      } else {
        MatchLoader.dom.list.innerHTML = html;
        // 绑定滚动
        self.slide();
        // 加载完成 显示
        $match.show();
        var $match_item = $mrms.find(".mrms_item"),
          match_duing = DC.byId("match_duing"),
          match_prev = DC.byId("match_prev");
        var idx = 0;
          if( match_duing ){
            idx = $match_item.index( $(match_duing) );
          } else if( match_prev ) {
            idx = $match_item.index( $(match_prev) );
          } else {
            idx = 1;
          }
        var page = Math.floor(idx/5);
        // 滚动到正在直播第一页
        self.slideObj.pageTo(page);
      }
      MatchLoader.hoverEvent();
    };
    MatchLoader.slide = function() {
      var self = this;
      var ScrollPic = require("ScrollPic");
      var scrollObj = new ScrollPic();
      scrollObj.scrollContId = "mrms";
      scrollObj.arrLeftId = "mrmsl";
      scrollObj.arrRightId = "mrmsr";
      scrollObj.dotListId = "";
      scrollObj.pageWidth = 462;
      scrollObj.frameWidth = 770;
      scrollObj.upright = false;
      scrollObj.speed = 20;
      scrollObj.space = 20;
      scrollObj.autoPlay = false;
      scrollObj.autoPlayTime = 2;
      scrollObj.circularly = false;
      scrollObj.initialize();

      document.getElementById('mrmsl').onclick = function(){
        scrollObj.pre();
        SUDA.uaTrack("sports_index_2014", "score_change");
        return false;
      }
      document.getElementById('mrmsr').onclick = function(){
        scrollObj.next();
        SUDA.uaTrack("sports_index_2014", "score_change");
        return false;
      }
      self.slideObj = scrollObj;
    };

    MatchLoader.bindEvent = function(){
          var self = this;
          $mlist.on("click","li:not(#mrhl_last)",function(){
            $(this).addClass("selected").siblings("li").removeClass("selected");
            var id = $(this).attr("id");
            // 存储用户操作id
            self.matchId = id;
            self.matchIdChange = true;
            self.renderMatch();
            // if(id == "match_all"){ 
            //  $mrms.find(".mrms_item").show(); 
            // } else {
            //  $mrms.find(".mrms_item").hide();
            //  $mrms.find("."+id).show();
            // }
            // // 滚动到第一页
            // self.slideObj.pageTo(0);
            return false;
          });

          // ipad 点击事件
          if(isIpad){
            $mrms.on("click",".mrms_item",function(){
              $(this).addClass("m_slideUp").siblings(".mrms_item").removeClass("m_slideUp");
              return false;
            });
            $("body").on("click",function(){
              $mrms.find(".mrms_item").removeClass("m_slideUp");
            });
          } else {
            $mrms.on("mouseenter",".mrms_item",function(){
              $(this).addClass("m_slideUp").siblings(".mrms_item").removeClass("m_slideUp");
              SUDA.uaTrack("sports_index_2014", "score_menu_show");
              return false;
            });
            $mrms.on("mouseleave",function(){
              $(this).find(".mrms_item").removeClass("m_slideUp");
              return false;
            });
            $mrms.on("click",".m_hover a",function(event){
              var $that = $(this);
              var typeVal = $that.data("type").trim();
              SUDA.uaTrack("sports_index_2014", typeVal);
              event.stopPropagation();
            });
          }
    }
    MatchLoader.bindEvent();

    MatchLoader.hoverEvent = function(){
          var self = this;
          $.each( $mrms.find(".m_hover") , function(i,val){
            var $item = $(this),
                $mhc = $item.find(".mh_c"),
                $mhca = $mhc.find("a"),
                len = $mhc.find("a").length;
            if($item.find(".mh_b").length > 0){
              $mhc.addClass("pt0");
            }

            if( len == 1 ){
              $mhc.addClass("mh_c1");
            } else if( len == 2 ){
              $mhc.addClass("mh_c2");
            } else if( len == 3 ){
              $mhc.addClass("mh_c3");
              $mhca.eq(0).addClass("mh_c3_1");
              $mhca.eq(1).addClass("ml0");
            } else {
              $mhc.addClass("mh_c4");
              $mhca.eq(0).addClass("ml0");
              $mhca.eq(2).addClass("ml0");
            }
          });
    }

    /**
     *调用定时器
     */ 
    MatchLoader.init();
    window.MatchLoader = MatchLoader;
  }).call(window, jQuery);
})

// 选择日期
udvDefine("choicedate",function (require, exports, module) {
  var defaultDate = (__curdate && __curdate.replace(/-/g,'/')) || new Date();
  var nowDate = util.dateFormatFmt( defaultDate, "yyyy/MM/dd");
  $('#smart_head_date').find('.form-control').val(nowDate);
  $('#smart_head_date .input-group.date').datepicker({
    format: "yyyy/mm/dd",
    startDate: "'2016-06-11'",
    endDate: "'2016-07-11'",
    todayBtn: "linked",
    language: "zh-CN",
    orientation: "bottom auto",
    autoclose: true,
    todayHighlight: true
  }).on('changeDate', function(ev){
    alert(util.dateFormatFmt( new Date(ev.date), "yyyy-MM-dd"));
    window.open(location.href,'_blank');
  });
});

// 购买小炮预测
udvDefine("purchase",function (require, exports, module) {
  var $mask = $("#mask"), $popup = $("#popup"), popup = $("#popup")[0];
  function popupShow() {
    var viewData = util.viewData();
    document.body.style.overflow = 'hidden';
    $popup.show();
    popup.style.visibility = "hidden";
    var cHeight = popup.offsetHeight;
    popup.style.marginTop = (viewData.viewHeight / 2 - cHeight / 2 - 30) + 'px';
    $mask.show();
    popup.style.visibility = "visible";
  };
  function popupHide() {
    document.body.style.overflow = 'auto';
    $mask.hide();
    $popup.hide();
  }
  var $match,$toggle_pre,$toggle_next,$percent_blue,$percent_bc;
  $("#smart_main").on("click", ".btn_purchase", function(){
    $match = $(this).closest(".smart_match");
    $toggle_pre = $match.find(".smart_toggle_pre");
    $toggle_next = $match.find(".smart_toggle_next");
    $percent_blue = $match.find(".smart_percent_blue");
    $percent_bc = $match.find(".smart_percent_bc");
    // 显示弹出层
    popupShow();
  });
  $(".popup_btn_close").on("click", function(){
    // 隐藏弹出层
    popupHide();
  });
  $(".popup_pay").on("click", function(){
    popupHide();
    $toggle_pre.hide();
    var hp = 50,gp=50;
    if(gp<=0){ $percent_blue.hide();}
    var pw = Math.ceil(260*gp/100);
    $percent_bc.width(pw);
    $toggle_next.show();
  });
});

// 实力分析 交战历史图表
udvDefine("echarts",function (require, exports, module) {
  // localStorage  存储数据 一个小时后重新获取数据
  var matchdata = {
    '2016-06-11_000001': {
      expires: '1463308371028',
      data:{

      }
    },
    '2016-06-12_000007': '',
    '2016-06-13_000021': '',
    '2016-06-14_000051': ''
  };

  if(!util){ util={}}
  util.data = {
    teamInfo: false,
    m1: false,
    m2: false,
    m3: false
  }
  var chart = {
    // 实力分析
    getdata_a1: function(){
      var self = this;
      if( util.data.m2 ){
        return;
      }
      var matchId = util.data.matchId || util.getQueryString("matchId") || '232151';
      $.ajax({  
        url:'http://odds.sports.sina.com.cn/odds/nbaprocvalue/teamsVsStatsShow/',
        dataType:'jsonp',
        data: {
          type: 'effanalysis',
          matchId: matchId,
          format: 'json'
        },
        cache: true,
        jsonpCallback:"effanalysis",
        type:"get",
        success: function(data) {
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            // console.log(result);
            util.data.m2 = result.data;
            util.data.m2.guestteamid = result.data.GuestTeamId;
            util.data.m2.hostteamid = result.data.HostTeamId;
            util.data.m2.guestname = result.data.GuestTeam;
            util.data.m2.homename = result.data.HostTeam;

            // 渲染图表
            self.chart_radar_a1();

          } else {
            util.log(result.status && result.status.msg);
          }
        }
      });
    },
    chart_radar_a1: function(){
      var data = util.data.m2;
      var guest = data.Guest;
      var host = data.Host;
      var gname = '德国';
      var hname = '法国';
      var gval =[], hval=[];

      gval.push(Math.ceil((guest.Avg_OffEfficiency-0)*100));
      gval.push(Math.ceil((guest.Avg_AssEfficiency-0)*100));
      gval.push(Math.ceil((guest.Avg_BloEfficiency-0)*100));
      gval.push(Math.ceil((guest.Avg_SteEfficiency-0)*100));
      gval.push(Math.ceil((guest.Avg_DefEfficiency-0)*100));

      hval.push(Math.ceil((host.Avg_OffEfficiency-0)*100));
      hval.push(Math.ceil((host.Avg_AssEfficiency-0)*100));
      hval.push(Math.ceil((host.Avg_BloEfficiency-0)*100));
      hval.push(Math.ceil((host.Avg_SteEfficiency-0)*100));
      hval.push(Math.ceil((host.Avg_DefEfficiency-0)*100));

      //确定阈值
      var maxval = [],gvalitem,hvalitem;
      for(var i=0,len=gval.length; i<len; i++){
        gvalitem = gval[i];
        hvalitem = hval[i];
        maxval.push(Math.max(gvalitem,hvalitem)+10);
      }

      // chart_radar_3_1 效率 radar
      var curTheme = {
        // 默认色板
        color: [
          '#62e5b5','#72c4e3','#99d2dd','#88b0bb',
          '#1c7099','#038cc4','#75abd0','#afd6dd'
        ]
      };
      var myChart = echarts.init(document.getElementById('chart_radar_a1'),curTheme);

      var option = {
        title : {
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            var indicatorNames = ['运气值','射门率','成功率','被侵犯率','得牌率'];
            var datas = params.value, result = params.name;
            for(var i=0,len=datas.length; i<len; i++){
              result += '<br /> '+indicatorNames[i] +':'+datas[i]+'%';
            }
            return result;
          }
        },
        legend: {
          x: '27px',
          y: '290px',
          data:[gname,hname]
        },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: '运气值', max: maxval[0]},
            { name: '射门率', max: maxval[1]},
            { name: '成功率', max: maxval[2]},
            { name: '被侵犯率', max: maxval[3]},
            { name: '得牌率', max: maxval[4]}
          ],
          center: ['50%','45%'],
          radius: 112,
          name: {
            textStyle: {
              color:'#313336',
              fontSize: '14',
              fontWeight: 'normal'
            }
          }
        },
        series: [
          {
            type: 'radar',
            areaStyle: {normal: {}},
            itemStyle: {normal: {areaStyle: {type: 'default'}}},
            data : [
              {
                value : gval,
                name : gname
              },
               {
                value : hval,
                name : hname
              }
            ]
          }
        ]
      };
      myChart.setOption(option, true);
    },
    // 交战历史
    chart_pie_a2: function(data){
      var win = '赢';
      var lose = '输';
      var equal = '平';
      // chart_pie_a2  pie
      var curTheme = {
        // 默认色板
        color: [
          '#e04f5c','#8dcbd8','#46556d','#88b0bb',
          '#1c7099','#038cc4','#75abd0','#afd6dd'
        ]
      };
      var myChart = echarts.init(document.getElementById('chart_pie_a2'),curTheme);
      var option = {
        title : {
        },
        tooltip: {
          trigger: 'item',
          formatter: "{b}: {c} 胜"
        },
        legend: {
          orient: 'vertical',
          x: '20px',
          y: 'center',
          data:[ win,lose,equal]
        },
        series: [
          {
            name:'交战历史',
            type:'pie',
            center: ['60%', '50%'],    // 默认全局居中
            radius: ['50%', '85%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data:[
              {value:'1', name:win},
              {value:'3', name:lose},
              {value:'2', name:equal},
            ]
          }
        ]
      };
      myChart.setOption(option, true);
    },
    // 主队走势
    chart_pie_a3: function(data){
      var win = '赢';
      var lose = '输';
      var equal = '平';
      // chart_pie_a2  pie
      var curTheme = {
        // 默认色板
        color: [
          '#e04f5c','#8dcbd8','#46556d','#fff'
        ]
      };
      var myChart = echarts.init(document.getElementById('chart_pie_a3'),curTheme);
      var option = {
        title : {
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params, ticket, callback) {
            if(params.data.name == ''){ return;}
            return params.data.name+ ":" + params.data.value +"%";
          }
        },
        legend: {
          orient: 'vertical',
          x: '10px',
          y: '10px',
          data:[ win,lose,equal]
        },
        series: [
          {
            name:'主队走势',
            type:'pie',
            startAngle: 180,
            center: ['55%', '50%'],    // 默认全局居中
            radius: ['66%', '88%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data:[
              {value:'70', name:win},
              {value:'10', name:lose},
              {value:'20', name:equal},
              {
                value:'100', 
                name:'',
                itemStyle: {
                  normal : {
                    color: 'rgba(0,0,0,0)',
                    label: {show:false},
                    labelLine: {show:false}
                  },
                  emphasis : {
                    color: 'rgba(0,0,0,0)'
                  }
                }
              }
            ]
          }
        ]
      };
      myChart.setOption(option, true);
    },
    // 客队走势
    chart_pie_a4: function(data){
      var win = '赢';
      var lose = '输';
      var equal = '平';
      // chart_pie_a4  pie
      var curTheme = {
        // 默认色板
        color: [
          '#e04f5c','#8dcbd8','#46556d','#fff'
        ]
      };
      var myChart = echarts.init(document.getElementById('chart_pie_a4'),curTheme);
      var option = {
        title : {
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params, ticket, callback) {
            if(params.data.name == ''){ return;}
            return params.data.name+ ":" + params.data.value +"%";
          }
        },
        legend: {
          orient: 'vertical',
          x: '10px',
          y: '10px',
          data:[ win,lose,equal]
        },
        series: [
          {
            name:'主队走势',
            type:'pie',
            startAngle: 180,
            center: ['55%', '50%'],    // 默认全局居中
            radius: ['66%', '88%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data:[
              {value:'30', name:win},
              {value:'50', name:lose},
              {value:'20', name:equal},
              {
                value:'100', 
                name:'',
                itemStyle: {
                  normal : {
                    color: 'rgba(0,0,0,0)',
                    label: {show:false},
                    labelLine: {show:false}
                  },
                  emphasis : {
                    color: 'rgba(0,0,0,0)'
                  }
                }
              }
            ]
          }
        ]
      };
      myChart.setOption(option, true);
    },
    controller: function(){
      var self = this;
      self.getdata_a1();
      self.chart_pie_a2(util.data.m1);
      self.chart_pie_a3(util.data.m1);
      self.chart_pie_a4(util.data.m1);
    }
  }
  var app = {
    getData: function(){
      var matchId = util.getQueryString("matchId") || '232151';
      util.data.matchId = matchId;
      $.ajax({  
        url:'http://odds.sports.sina.com.cn/odds/nbaprocvalue/teamVsHistory/',
        dataType:'jsonp',
        data: {
          matchId: matchId,
          format: 'json'
        },
        cache: true,
        jsonpCallback:"teamVsHistory",
        type:"get",
        success: function(data) {
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            // console.log(result.data);
            util.data.m1 = result.data;
            util.data.m1.teamInfo = {
              'guestname':result.data.GuestTeam,
              'guestlogo':result.data.GuestTeamLogo,
              'homename': result.data.HostTeam,
              'homelogo':result.data.HostTeamLogo,
            };
            chart.controller();
          } else {
            util.log(result.status && result.status.msg);
          }
        }
      });
    },
    controller: function(){
      var self = this;
      self.getData();
    }
  }
  app.controller();
});