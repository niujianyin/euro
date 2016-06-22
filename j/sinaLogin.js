
// 登录模块 
var sinaLoginLayer = SINA_OUTLOGIN_LAYER;
var loginUrl = "http://ai.lottery.sina.com.cn/uc/order/index";
var logoutUrl = "http://euro.sina.com.cn/lottery/";
var baseurl = 'http://ai.lottery.sina.com.cn/';

window.__SinaTopBar__.user.init(document.getElementById('SI_User'), {
  entry: 'caitong',
  login_success: function() {
    var sinaURL = 'http://api.sina.com.cn/weibo/wb/users_show.json?uid=';
    var SUP = getSinaWbCookieVal('SUP');
    var wbId = '';
    var tmp = SUP.split('&');
    for (var i = 0; i < tmp.length; i++) {
      var arr = tmp[i].split('=');
      if ('uid' == arr[0]) {
        wbId = arr[1];
        util.wbId = wbId;
        break;
      }
    }
    $.ajax({
      url: sinaURL + wbId,
      type: "GET",
      dataType: "jsonp",
      async: false,
      success: function(jsonMsg) {
        //console.log(jsonMsg);                 
        var sts = jsonMsg.result.status.msg;
        if ('success' == sts) {
          var _uid = jsonMsg.result.data.id;
          if (_uid != wbId) {
            // util.alert('读取新浪接口返回的微博id不一不致');
            return null;
          }

          var nickName = jsonMsg.result.data.name;
          var wbImg = jsonMsg.result.data.avatar_large;

          //将微博昵称和wbId放cookie中
          var ckName = 'SINA_WB_LOCAL_NICKNAME';
          var ckNameId = 'SINA_WB_LOCAL_NICKNAME_UID';
          var ckLogoUrl = 'SINA_WB_LOCAL_LOGO_URL';
          var ckDomain = 'sina.com.cn';
          setSinaWbCookie(ckName, nickName, ckDomain, 0);
          setSinaWbCookie(ckNameId, _uid, ckDomain, 0);
          setSinaWbCookie(ckLogoUrl, wbImg, ckDomain, 0);
          util.wbId = wbId;
          $('#sina-top-bar-right').show();

          // 登录成功之后  验证是否已经购买过比赛。  需要测试
          if(window.switchGame){
            for(var i=0; i<4; i++){
              window.switchGame(i);
            }
          }
          
          if(window.mdinfo && mdinfo.livecast_id){
            var matchId= mdinfo.livecast_id;
            getMdData(matchId);
          }
        } else {
          // util.alert('读取新浪接口获取微博信息失败');
          return null;
        }
      }
    });
  },
  logout_success: function() {
    $('#sina-top-bar-right').hide();
    location.href = logoutUrl;
  }
});

sinaLoginLayer.set('plugin',   { 
  qqLogin :  false
});

sinaLoginLayer.set('styles',   {
  marginLeft: '0px'
});

function middleLogin(msg) {
  var UserPanel = SINA_USER_PANEL;
  UserPanel.setOutLoginMiddle();
  UserPanel.getOutLogin().show();
  // 可添加提示
  __SinaTopBar__.user.showTip(msg);
}

function checkLogin() {
  if (sinaLoginLayer) {
    return sinaLoginLayer.isLogin();
  }
  return false;
}

function setSinaWbCookie(name, value, domain, expires) {
  domain = domain || document.domain;
  if (typeof(expires) == 'undefiend' || expires == null || expires == '') {
    document.cookie = name + "=" + encodeURIComponent(value) + "; path=" + "/" + "; domain=" + domain;
  } else {
    var expTimes = expires * 1000;
    var expDate = new Date();
    expDate.setTime(expDate.getTime() + expTimes);
    document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expDate.toGMTString() + "; path=" + "/" + "; domain=" + domain;
  }
}

function getSinaWbCookieVal(name) {
  var cookieArr = document.cookie.replace(/\s/g, "").split(';');
  for (var i = 0; i < cookieArr.length; i++) {
    var tempObj = cookieArr[i].split('=');
    if (tempObj[0] == name)
      return decodeURIComponent(tempObj[1]);
  }
  return null;
}

util.alert = function(msg){
  $('#popup_msg').html(msg);
  popupShow($popup_msg);
}

/**
 *支付模块
 */
// 3种玩法 玩法类型:z_sx(上下盘) z_spf(胜平负) z_dx(大小球)  默认z_sx
var euro_gameType = 'z_sx';
var euro_gameTypeArr = ['z_sx','z_spf','z_dx'];
var euro_pankou = '';
var euro_hostTeam = '';
var euro_awayTeam = '';
var euro_matchTime = '';
// 用户id nba_-param_sm
var euro_memberid = '';
// 订单id nba_-param_so
var euro_orderid= '';
// 比赛id nba_-param_sb
var euro_matchid= '';

util.wbId = '';
util.payduing={};
util.money = {};
util.payment = {
  getwbid: function(){
    //判断登录状态
    var isLogin = checkLogin();
    if(!isLogin){
      return false;
    } else {
      var SUP = getSinaWbCookieVal('SUP');
      if (null == SUP || SUP == '') {
        return false;
      }
      var wbId = '';
      var tmp = SUP.split('&');
      for (var i = 0; i < tmp.length; i++) {
        var arr = tmp[i].split('=');
        if ('uid' == arr[0]) {
          wbId = arr[1];
          util.wbId = wbId;
          break;
        }
      }
      if (wbId == '') {
        return false;
      }
      var nickName = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME');
      var uId = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME_UID');
      if (wbId != uId) {
        return false;
      }
      return wbId;
    }
  },
  /** wiki: http://wiki.intra.sina.com.cn/pages/viewpage.action?pageId=101711884
    *http://odds.sports.sina.com.cn/odds/uefa/ckPro?thirdId=1247653442&gameType=z_sx&matchId=139180&format=json
    *0:成功返回预测结果数据
    400:玩法类型格式错误
    400:用户未登录或ID不匹配
    400:比赛ID不存在
    300:未绑定手机号码
    402:暂无单场的购买记录
    405:未购买当前玩法预测数据
    500:暂时没有本场预测数据  
   */
  // step0 进入页面直接验证比赛id 获取相应的数据
  payStep0: function(thirdId, matchId, gameType){
    // 再次判断一次wbId
    if(!thirdId){
      var SUP = getSinaWbCookieVal('SUP');
      if (null == SUP || SUP == '') {
        util.alert("在购买前请先登录");
        return;
      }
      var wbId = '';
      var tmp = SUP.split('&');
      for (var i = 0; i < tmp.length; i++) {
        var arr = tmp[i].split('=');
        if ('uid' == arr[0]) {
          wbId = arr[1];
          util.wbId = wbId;
          break;
        }
      }
      if (wbId == '') {
        util.alert("在购买前请先登录");
        return;
      }

      var nickName = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME');
      var uId = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME_UID');
      if (wbId != uId) {
        util.alert("获取登录信息异常,请重新登录");
        return;
      }
      thirdId = wbId;
    }

    var self = this;
    $.ajax({
      url:'http://odds.sports.sina.com.cn/odds/uefa/ckPro?thirdId='+thirdId+'&gameType='+gameType+'&matchId='+matchId+'&format=json',
      dataType:'jsonp',
      data: {},
      cache: true,
      jsonpCallback:"ckPro_step0_"+matchId +"_"+gameType,
      type:"get",
      success: function(data) {
          // data = {
          //   "result":  {
          //     "status":  {
          //       "code": 500,
          //       "msg": ""
          //     },
          //     "matchId":matchId,
          //     "thirdId":"1247653442",
          //     "gameType":gameType,
          //     "member_id": "519526",
          //     "data": {
          //       "hostWinPro":0.65,//'上盘概率'
          //       "awayWinPro":0.35,//'下盘概率'
          //       "pinWinPro":0.35,
          //       "awayScore":0,
          //       "hostScore":0,
          //       "pankou":"1/1.25",//'上下盘盘口'
          //       "forecastResult":1, //0（未给出结果），－1（错），1（准）
          //       "matchStatus":3  //1(未赛)，2（赛中），3（完赛）
          //     }
          //   }
          // }
        var rdata = data.result;
        if (rdata.status.code === 0) {
          render_smart(data.result);
        } else if(rdata.status.code == 500) {
          // 暂时没有本场比赛的预测  按钮置灰
          $("#smart_purchase_"+matchId).removeClass("btn_purchase").addClass("btn_purchase_no");
        }
      }
    });
  },
  /** wiki: http://wiki.intra.sina.com.cn/pages/viewpage.action?pageId=101711884
    *http://odds.sports.sina.com.cn/odds/uefa/ckPro?thirdId=1247653442&gameType=z_sx&matchId=139180&format=json
    *0:成功返回预测结果数据
    400:玩法类型格式错误
    400:用户未登录或ID不匹配
    400:比赛ID不存在
    300:未绑定手机号码
    402:暂无单场的购买记录
    405:未购买当前玩法预测数据
    500:暂时没有本场预测数据  
   */
  // step1 点击购买小炮预测验证比赛id  获取相应的数据
  payStep1: function(thirdId, matchId, gameType, pankou, hostTeam, awayTeam, matchTime, ismd){
    // 再次判断一次wbId
    if(!thirdId){
      var SUP = getSinaWbCookieVal('SUP');
      if (null == SUP || SUP == '') {
        util.alert("在购买前请先登录");
        return;
      }
      var wbId = '';
      var tmp = SUP.split('&');
      for (var i = 0; i < tmp.length; i++) {
        var arr = tmp[i].split('=');
        if ('uid' == arr[0]) {
          wbId = arr[1];
          util.wbId = wbId;
          break;
        }
      }
      if (wbId == '') {
        util.alert("在购买前请先登录");
        return;
      }

      var nickName = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME');
      var uId = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME_UID');
      if (wbId != uId) {
        util.alert("获取登录信息异常,请重新登录");
        return;
      }
      thirdId = wbId;
    }

    var self = this;
    // 为下一步点击立即支付按钮全局存储信息
    euro_matchid = matchId;
    euro_gameType = gameType;
    euro_pankou = pankou;
    euro_hostTeam = hostTeam;
    euro_awayTeam = awayTeam;
    euro_matchTime = matchTime;

    // 比分条区域
    util.payduing[matchId + '_' + gameType]= true;

    $.ajax({
      url:'http://odds.sports.sina.com.cn/odds/uefa/ckPro?thirdId='+thirdId+'&gameType='+gameType+'&matchId='+matchId+'&format=json',
      dataType:'jsonp',
      data: {},
      cache: true,
      jsonpCallback:"ckPro_step1_"+matchId+"_"+gameType,
      type:"get",
      success: function(data) { 
        // if(gameType == 'z_sx'){
        //   data = {
        //         "result":  {
        //           "status":  {
        //             "code": 405,
        //             "msg": ""
        //           },
        //           "matchId":"139180",
        //           "thirdId":"1247653442",
        //           "gameType":"z_sx",
        //           "member_id": "519526",
        //           "data": {
        //             "hostWinPro":0.65,//'上盘概率'
        //             "awayWinPro":0.35,//'下盘概率'
        //             "pinWinPro":0.75,
        //             "awayScore":0,
        //             "hostScore":0,
        //             "pankou":"1/1.25"//'上下盘盘口'
        //           }
        //         }
        //       }
        // } else if(gameType == 'z_spf'){
        //   data = {
        //         "result":  {
        //           "status":  {
        //             "code": 405,
        //             "msg": ""
        //           },
        //           "matchId":"139180",
        //           "thirdId":"1247653442",
        //           "gameType":"z_spf",
        //           "member_id": "519526",
        //           "data": {
        //             "hostWinPro":0.35,//'上盘概率'
        //             "awayWinPro":0.35,//'下盘概率'
        //             "pinWinPro":0.35,
        //             "awayScore":0,
        //             "hostScore":0,
        //             "pankou":"2.5"//'上下盘盘口'
        //           }
        //         }
        //       }
        // } else {
        //   data = {
        //         "result":  {
        //           "status":  {
        //             "code": 0,
        //             "msg": ""
        //           },
        //           "matchId":"139180",
        //           "thirdId":"1247653442",
        //           "gameType":"z_dx",
        //           "member_id": "519526",
        //           "data": {
        //             "hostWinPro":0.35,//'上盘概率'
        //             "awayWinPro":0.35,//'下盘概率'
        //             "pinWinPro":0.35,
        //             "awayScore":0,
        //             "hostScore":0,
        //             "pankou":"3.5/4"//'上下盘盘口'
        //           }
        //         }
        //       }
        // }
        
        //   0:成功返回预测结果数据
        // 400:玩法类型格式错误
        // 400:用户未登录或ID不匹配
        // 400:比赛ID不存在
        // 300:未绑定手机号码
        // 402:暂无单场的购买记录
        // 405:未购买当前玩法预测数据
        // 500:暂时没有本场预测数据
        var code = data.result.status.code;
        if (code === 0) {
          var rdata = data.result;
          euro_memberid = rdata.member_id;
          if(ismd){
            render_md_haspay(rdata);
          } else {
            render_smart(rdata);
          }
          
        } else if (code == 300) { //未关联注册  
          var nickName = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME');
          registerForm(thirdId, nickName, 1); //转发到用户中心注册页面
          return;
        } else if(code == 405 || code == 402){
          //405订单是未支付的,当前页面弹出充值提示  402没有单场购买记录
          var strpankou = (pankou == 'z_spf')? '':('&pankou='+pankou);
          $.ajax({
            url:'http://ai.lottery.sina.com.cn/zc/order/dc.htm?thirdId='+thirdId+'&matchId='+matchId+'&gameType='+gameType+strpankou,
            dataType:'jsonp',
            data: {},
            cache: true,
            jsonpCallback:"dc_"+matchId,
            type:"get",
            success: function(dcdata) {
              var code = dcdata.code;
              if( code && (code == "201" || code == "200")){
                // 获取真实的价格
                $.ajax({
                  url:'http://odds.sports.sina.com.cn/uefa/userCurPrice?thirdId='+thirdId+'&matchID='+matchId+'&price=29&format=json',
                  dataType:'jsonp',
                  data: {},
                  cache: true,
                  jsonpCallback:"userCurPrice_"+matchId,
                  type:"get",
                  success: function(data) {
                    // data = {
                    //   "result":  {
                    //     "status":  {
                    //     "code": 0,
                    //     "msg": ""
                    //     },
                    //     "source_pirce": 29,//原价
                    //     "data":  {
                    //     "price": 1//当前适用价格
                    //     }
                    //   }
                    // };
                    // 显示弹出层
                    var result = data.result;
                    if(result.source_pirce != result.data.price ){
                      $(".popup_money").html(result.data.price+"元<em>"+result.source_pirce+"元</em>");
                    } else{
                      $(".popup_money").html(result.data.price+"元");
                    }
                    util.money[matchId] = result.data.price;
                    popupShow($popup);
                  }
                });
              } else if (code == 300) { //未关联注册  
                var nickName = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME');
                registerForm(thirdId, nickName, 1); //转发到用户中心注册页面
                return;
              } else {
                util.alert(dcdata.msg);
              }
            }
          });
        } else {
          util.alert(data.result.status.msg);
        }
        
        util.payduing[matchId + '_' + gameType]= false;
      }
    });
  },
  /**
   *一.单场--用户在预测页面上点选了某一场比赛的查看智能预测,大小盘,上下盘,胜平负盘的查看,切换gameType即可.
   用户首次发起订单时,这个接口不生成订单,返回空的订单号
   用户已发起过订单但未支付时,这个接口会返回用户的订单号
   返回success后,在新浪用户页面弹出发起订单的弹窗,显示 立即支付 的按钮

     http://ai.lottery.sina.com.cn/zc/order/dc.htm?thirdId=2007294495&matchId=139180&gameType=z_dx&pankou=1/1.25

  参数验证错误时的返回结果:
  {"result":"error","code":400,"msg":"第三方id不能为空"}  thirdId不能为空
  {"result":"error","code":400,"msg":"比赛id不能为空"}  matchId不能为空
  {"result":"error","code":400,"msg":"玩法类型不能为空"}  gameType不能为空
  {"result":"error","code":400,"msg":"玩法类型格式错误"}  gameType格式错误
  {"result":"error","code":400,"msg":"盘口不能为空"}   当用户是发起的大小盘和上下盘时,要传递pankou(盘口)
  {"result":"error","code":300,"msg":"请先绑定手机号码"}  用户未绑定手机号码
  {"result":"error","code":400,"msg":"未查询到此比赛"}  根据新浪传递的matchId(livecast_id),未查询到比赛
  {"result":"error","code":400,"msg":"本场比赛已开赛,不能下单"}  本场比赛已开赛,不能下单
  {"result":"error","code":400,"msg":"暂时没有本场比赛的预测"}  暂时没有本场比赛的预测数据
  {"result":"error","code":402,"msg":"本场比赛你已支付成功,不能重复支付"}  本场比赛你已支付成功,不能重复支付


  各参数和环节验证成功,返回success:
  首次发起订单时,返回空的订单号
  {"memberId":519526,"result":"success","code":201,"orderLogNo":""}
  用户已发起过订单但未支付时,接口返回用户已存在的订单号
  {"memberId":519526,"result":"success","code":200,"orderLogNo":"w"}
   */ 
  // step2 点击弹出层立即支付按钮 先验证是否存在订单号
  payStep2: function(thirdId,matchId,gameType,pankou){
    var self = this;
    var strpankou = pankou == 'z_spf'? '':('&pankou='+pankou);
    $.ajax({
      url:'http://ai.lottery.sina.com.cn/zc/order/dc.htm?thirdId='+thirdId+'&matchId='+matchId+'&gameType='+gameType+strpankou,
      dataType:'jsonp',
      data: {},
      cache: true,
      jsonpCallback:"dc_"+matchId,
      type:"get",
      success: function(data) {
        // data = {"memberId":519526,"result":"success","code":201,"orderLogNo":"w"};
        var code = data.code;
        if( code && code == "201"){
          // 不存在订单号  直接 payStep3  生成订单号
          self.payStep3( util.wbId, euro_matchid, util.money[euro_matchid],data.memberId, euro_gameType, euro_pankou);
        } else if(code && code == "200"){
          // 已存在订单号  1.打开新开页面paypre.html  2.显示弹出层 我已支付成功
          // data = {"matchId":"139180","memberId":519526,"gameType":"z_dx","pankou":"1/1.25","result":"success","code":200,"orderLogNo":"D1605261057018327995","hostTeam":" 法国","awayTeam":"罗马尼亚","matchTime":"2016-06-11 03:00"}
          data.matchId = euro_matchid;
          data.gameType = euro_gameType;
          data.pankou = euro_pankou;
          data.result = "success";
          data.code = 200;
          data.hostTeam = euro_hostTeam;
          data.awayTeam = euro_awayTeam;
          data.matchTime = euro_matchTime;
          euro_memberid = data.memberId;
          self.payStepToPaypre(data);

          euro_orderid = data.orderLogNo;
          popupShow($popup_canpay);
        } else if (code == 300) { //未关联注册  
          var nickName = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME');
          registerForm(thirdId, nickName, 1); //转发到用户中心注册页面
          return;
        } else {
          util.alert(data.msg);
        }
      }
    });
  },
  /**
   * wiki:
   http://wiki.intra.sina.com.cn/pages/viewpage.action?pageId=101711874
   */ 
  // step3 点击弹出层立即支付按钮 没有订单号 生成订单号
  payStep3: function(thirdId,matchID,price,memberId,gameType,pankou){
    var self = this;
    $.ajax({
      url:'http://odds.sports.sina.com.cn/uefa/dcToPay?format=json',
      data: {
        thirdId:thirdId,
        matchId:matchID,
        price:price,
        memberId:memberId,
        gameType:gameType,
        pankou:pankou
      },
      cache: true,
      type:"post",
      success: function(data) {
        // data = {"matchId":"139180","memberId":519526,"gameType":"z_dx","pankou":"1/1.25","result":"success","code":200,"orderLogNo":"D1605261057018327995","hostTeam":" 法国","awayTeam":"罗马尼亚","matchTime":"2016-06-11 03:00"}
        var code = data.code;
        if(code && code == "200"){
          // 生成订单号  1.打开新开页面paypre.html  2.显示弹出层 我已支付成功
          self.payStepToPaypre(data);

          euro_orderid = data.orderLogNo;
          euro_memberid = data.memberId;
          popupShow($popup_canpay);
        } else if (code == 300) { //未关联注册  
          var nickName = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME');
          registerForm(thirdId, nickName, 1); //转发到用户中心注册页面
          return;
        } else {
          util.alert(data.msg);
        }
      }
    });
  },
  // 打开页面 ./payper.htm
  payStepToPaypre: function(data){
    var self = this;

    var self = this;
    var info = JSON.stringify(data);
    var thirdId = util.wbId;
    var price = util.money[data.matchId];

    var actionUrl = 'http://odds.sports.sina.com.cn/uefa/prePay?info='+info+'&thirdId='+thirdId + '&price='+price;
    window.newWin.location.href = actionUrl;
    
    // var actionUrl = 'http://odds.sports.sina.com.cn/uefa/prePay';
    // var payForm = document.createElement("form");
   
    // document.body.appendChild(payForm);
    // payForm.method = 'post';
    // payForm.action = actionUrl;
    // payForm.id = 'pay_form';
    // payForm.target = '_blank';

    // //创建隐藏表单1
    // var input1 = document.createElement("input");
    // input1.setAttribute("name", "info");
    // input1.setAttribute("type", "hidden");
    // input1.setAttribute("value", JSON.stringify(data));
    // payForm.appendChild(input1);

    // //创建隐藏表单2
    // var input2 = document.createElement("input");
    // input2.setAttribute("name", "thirdId");
    // input2.setAttribute("type", "hidden");
    // input2.setAttribute("value", util.wbId);
    // payForm.appendChild(input2);

    // //创建隐藏表单3
    // var input3 = document.createElement("input");
    // input3.setAttribute("name", "price");
    // input3.setAttribute("type", "hidden");
    // input3.setAttribute("value", util.money[data.matchId]);
    // payForm.appendChild(input3);

    // payForm.submit();
    // document.body.removeChild(payForm);
  },
  /**
   *三.单场--支付落地页面的 立即支付 接口:
   http://ai.lottery.sina.com.cn/zc/order/dcPay.htm?orderNo=D1605261057018327995&memberId=519526&matchId=139180&chargeWay=zfb

   这个接口爱彩系统会从request的cookie中取用户的微博登录信息SUP和uid


  参数验证错误时的返回结果,传递的memberId   matchId  orderNo会同步返回
  {"result":"error","code":400,"msg":"你还没有登录新浪微博,请先登录新浪微博"}  未取到cookie中的sup信息,未登录新浪微博
  {"result":"error","code":400,"msg":"你的登录状态异常,新重新登录"} 有取到sup,但未取到uid.
  {"result":"error","code":300,"msg":"请先绑定手机号码"}  用户未绑定手机号码
  {"result":"error","code":400,"msg":"用户id不能为空"}  memberId不能为空 
  {"result":"error","code":400,"msg":"比赛id不能为空"}  matchId不能为空 
  {"result":"error","code":400,"msg":"订单号不能为空"}  orderNo不能为空
  {"result":"error","code":400,"msg":"未查询到你的订单,请从首页重新发起"}  根据传递的orderNo,未查询到此订单
  {"result":"error","code":402,"msg":"本场比赛你已支付成功,不能重复支付"}  本场比赛你已支付成功,不能重复支付

  chargeWay没有做非空的判断,当为空时,系统默认支付宝的支付方式

  当各环节验证成功后,返回爱彩系统的充值连接redirectURL,新浪接收到success后,在用户当前窗口打开此充值连接redirectURL,进入爱彩支付流程
  支付流程在爱彩系统完成,由爱彩接收第三方支付系统的返回消息,并做支付成功后的处理(同步更新此订单的支付状态为已支付)
  success返回结果:
  {"memberId":519526,"orderNo":"D1605261057018327995","matchId":"139180","result":"success","code":200,"redirectURL":"http://ai.lottery.daily.2caipiao.com/sina-payment/charge.do?gameType=z_dx&amount=29.00&clientType=4&chargeWay=4&matchId=139180&memberId=519526&sign=99db726978f67fd12d8ebcf89f12c20f&orderNo=D1605261057018327995"}
   */ 
  // step4 在新页面 http://ai.lottery.sina.com.cn//nba/payweb/pre.htm 立即支付按钮
  payStep4: function(orderNo,memberId,matchId,chargeWay){
    var self = this;
    $.ajax({
      url:'http://ai.lottery.sina.com.cn/zc/order/dcPay.htm?orderNo='+orderNo+'&memberId='+memberId+'&matchId='+matchId+'&chargeWay='+chargeWay,
      dataType:'jsonp',
      data: {},
      cache: true,
      jsonpCallback:"dcPay_"+matchId,
      type:"get",
      success: function(data) {
        var code = data.code;
        // util.windowOpen("http://ai.lottery.daily.2caipiao.com/sina-payment/charge.do?gameType=z_dx&amount=29.00&clientType=4&chargeWay=4&matchId=139180&memberId=519526&sign=99db726978f67fd12d8ebcf89f12c20f&orderNo=D1605261057018327995",'_self');
        if(code && code == "200"){
          // 跳转到真正的支付页面
          util.windowOpen(data.redirectURL,'_self');
        } else {
          util.alert(data.msg);
        }
      }
    });
  },
  /**
   *四.单场--用户在发起订单的弹窗中点了 '我已支付成功' 的接口:
   已有订单号的:
   http://ai.lottery.sina.com.cn/zc/order/dcSuc.htm?orderNo=D1605261057018327995&memberId=519526&matchId=139180&gameType=z_dx
   无订单号的,我会根据memberId+matchId+gameType查询出来
   http://ai.lottery.sina.com.cn/zc/order/dcSuc.htm?orderNo=&memberId=519526&matchId=139180&gameType=z_dx


  参数验证错误时的返回结果,传递的orderNo memberId  matchId  gameType会同步返回
  {"result":"error","code":400,"msg":"你还没有登录新浪微博,请先登录新浪微博"}  未取到cookie中的sup信息,未登录新浪微博
  {"result":"error","code":400,"msg":"你的登录状态异常,新重新登录"} 有取到sup,但未取到uid.
  {"result":"error","code":300,"msg":"请先绑定手机号码"}  用户未绑定手机号码
  {"result":"error","code":400,"msg":"用户id不能为空"}  memberId不能为空 
  {"result":"error","code":400,"msg":"比赛id不能为空"}  matchId不能为空 
  {"result":"error","code":400,"msg":"玩法类型不能为空"}  gameType不能为空
  {"result":"error","code":400,"msg":"未查询到你的订单,请从首页重新发起"}  根据传递的有值的orderNo,未查询到此订单

  支付成功,返回success,并同步返回此比赛的预测结果,便于用户页面同步显示预测结果:
  {"matchId":"139180","memberId":519526,"orderNo":"D1605261057018327995","gameType":"z_dx","result":"success","code":200,"hostWinPro":5629,"awayWinPro":4370,"pinWinPro":0,"awayScore":0,"hostScore":0,"pankou":"1/1.25"}
   */
  // step5 弹出层 我已支付成功按钮
  payStep5: function(orderNo,memberId,matchId,gameType, ismd){
    var self = this;
    var url = '';
    if(orderNo){
      // url = 'http://ai.lottery.sina.com.cn/zc/order/dcSuc.htm?orderNo='+orderNo+'&memberId='+memberId+'&matchId='+matchId+'&gameType='+gameType;
      url = 'http://odds.sports.sina.com.cn/uefa/dcSuc?format=json&orderNo='+orderNo+'&memberId='+memberId+'&matchId='+matchId+'&gameType='+gameType;
    } else {
      url = 'http://odds.sports.sina.com.cn/uefa/dcSuc?format=json&orderNo=&memberId='+util.wbId+'&matchId='+matchId+'&gameType='+gameType;
    }
    $.ajax({
      url:url,
      dataType:'jsonp',
      data: {},
      cache: true,
      jsonpCallback:"dcSuc_"+gameType +"_"+matchId,
      type:"get",
      success: function(data) {
        // data = {"matchId":"139180","memberId":519526,"orderNo":"D1605261057018327995","gameType":"z_dx","result":"success","code":200,"hostWinPro":5629,"awayWinPro":4370,"pinWinPro":0,"awayScore":0,"hostScore":0,"pankou":"1/1.25"}
        var code = data.result.status && data.result.status.code;
        if(code ===0){
          // 渲染数据render
          // data = {
          //   "result":  {
          //     "status":  {
          //       "code": 0,
          //       "msg": ""
          //     },
          //     "matchId":"139180",
          //     "thirdId":"1247653442",
          //     "gameType":gameType,
          //     "member_id": "519526",
          //     "data": {
          //       "hostWinPro":0.35,//'上盘概率'
          //       "awayWinPro":0.35,//'下盘概率'
          //       "pinWinPro":0.35,
          //       "awayScore":0,
          //       "hostScore":0,
          //       "pankou":"1/1.25"//'上下盘盘口'
          //     }
          //   }
          // }
          if(ismd){
            render_md_haspay(data.result);
          } else {
            render_smart(data.result);
          }
        } else {
          util.alert(data.result.status.msg);
        }
      }
    });
  },

  /** wiki: http://wiki.intra.sina.com.cn/pages/viewpage.action?pageId=101711884
    *http://odds.sports.sina.com.cn/odds/uefa/ckPro?thirdId=1247653442&gameType=z_sx&matchId=139180&format=json
    *0:成功返回预测结果数据
    400:玩法类型格式错误
    400:用户未登录或ID不匹配
    400:比赛ID不存在
    300:未绑定手机号码
    402:暂无单场的购买记录
    405:未购买当前玩法预测数据
    500:暂时没有本场预测数据  
   */
  // step10 数据页面进入页面直接验证比赛id 获取相应的数据
  payStep10: function(thirdId, matchId, isArr){
    // 再次判断一次wbId
    if(!thirdId){
      var SUP = getSinaWbCookieVal('SUP');
      if (null == SUP || SUP == '') {
        return;
      }
      var wbId = '';
      var tmp = SUP.split('&');
      for (var i = 0; i < tmp.length; i++) {
        var arr = tmp[i].split('=');
        if ('uid' == arr[0]) {
          wbId = arr[1];
          util.wbId = wbId;
          break;
        }
      }
      if (wbId == '') {
        return;
      }

      var nickName = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME');
      var uId = getSinaWbCookieVal('SINA_WB_LOCAL_NICKNAME_UID');
      if (wbId != uId) {
        return;
      }
      thirdId = wbId;
    }

    var self = this;
    for(var i=0,len=euro_gameTypeArr.length; i<len; i++){
      var gameType = euro_gameTypeArr[i];
      if(isArr[i] != 1){ continue;}
      (function(gameType){
        $.ajax({
          url:'http://odds.sports.sina.com.cn/odds/uefa/ckPro?thirdId='+thirdId+'&gameType='+gameType+'&matchId='+matchId+'&format=json',
          dataType:'jsonp',
          data: {},
          cache: true,
          jsonpCallback:"md_ckPro_step0_"+matchId+"_"+gameType,
          type:"get",
          success: function(data) {
            // data = {
            //   "result":  {
            //     "status":  {
            //       "code": 0,
            //       "msg": ""
            //     },
            //     "matchId":matchId,
            //     "thirdId":"1247653442",
            //     "gameType":gameType,
            //     "member_id": "519526",
            //     "data": {
            //       "hostWinPro":0.65,//'上盘概率'
            //       "awayWinPro":0.35,//'下盘概率'
            //       "pinWinPro":0.35,
            //       "awayScore":0,
            //       "hostScore":0,
            //       "pankou":"1/1.25",//'上下盘盘口'
            //       "forecastResult":1, //0（未给出结果），－1（错），1（准）
            //       "matchStatus":3  //1(未赛)，2（赛中），3（完赛）
            //     }
            //   }
            // }
            var rdata = data.result;
            if (rdata.status.code === 0) {
              render_md_haspay(data.result);
            }
          }
        });
      })(gameType);
    }
  },
  openPage: function(){
    window.newWin = window.open('http://euro.sina.com.cn/lottery/','_blank');
    util.payment.payStep2(util.wbId, euro_matchid, euro_gameType, euro_pankou);
  }
}


// 显示相应的弹层
function popupShow($layout) {
  var viewData = util.viewData();
  var layout = $layout[0];
  document.body.style.overflow = 'hidden';
  $popup_box.hide();
  $layout.show();
  layout.style.visibility = "hidden";
  var cHeight = layout.offsetHeight;
  layout.style.marginTop = (viewData.viewHeight / 2 - cHeight / 2 - 30) + 'px';
  $mask.show();
  layout.style.visibility = "visible";
};
// 隐藏弹层
function popupHide() {
  document.body.style.overflow = 'auto';
  $mask.hide();
  $popup_box.hide();
}
// 渲染预测render_smart  赛前购买后
function render_smart(data){
  //已购买成功和已开赛 已结束的比赛
  // 隐藏弹出层
  popupHide();
  var matchId = data.matchId;
  var gameType = data.gameType;
  var rdata = data.data;
  var cdata = match_data.data[$('#smart_'+matchId).data("idx")];
  if(rdata.hostWinPro == ''){
    cdata.per1 = '';
    cdata.per2 = '';
    cdata.per3 = '';
    cdata.hscore = '';
    cdata.gscore = '';
    cdata.nodata = '智能数据正在分析中';
    html = template('smart_match_pre_'+gameType+'_haspay_tmp', {data: cdata});
    $('#smart_'+matchId)[0].innerHTML = html;
    return;
  }
  var per1 = Math.round((rdata.hostWinPro-0)*100),
      per2 = rdata.pinWinPro && Math.round((rdata.pinWinPro-0)*100),
      per3 = Math.round((rdata.awayWinPro-0)*100),
      hscore = rdata.hostScore,
      gscore = rdata.awayScore;

  cdata.per1 = per1 +'%';
  cdata.per2 = per2 +'%';
  cdata.per3 = per3 +'%';
  cdata.hscore = hscore;
  cdata.gscore = gscore;
  // render 显示盘口分数和比分条
  html = template('smart_match_pre_'+gameType+'_haspay_tmp', {data: cdata});
  $('#smart_'+matchId)[0].innerHTML = html;

  // 获取dom元素
  var $databox = $('#smart_data_' + matchId);
  $databox.html(dataTmp(per1,per2,per3,gameType));
}
// 渲染预测render_smart_in 赛中
function render_smart_in(data){
  //赛中
  // 隐藏弹出层
  popupHide();
  var matchId = data.matchId;
  var gameType = data.gameType;
  var rdata = data.om;

  // 'upperTapePro':0.35,//'上盘概率'
  // 'lowTapePro':0.35, //'下盘概率'
  // 'ULTape':2.5, //'上下盘盘口'
  // 'DXbigPro' :0.35, //'大分概率'
  // 'DXsmallPro':0.35, //'小分概率'
  // 'DXTape' :3.5/4 '大小分盘口'
  // 'SPFwinPro' :0.35, //'胜平负胜率'
  // 'SPFdrawPro' :0.35,//'胜平负平率'
  // 'SPFlosePro' :0.35, //'胜平负负率'
  var per1,per2,per3,pankou;
  if(gameType == 'z_sx'){
    per1 = Math.round((rdata.upperTapePro-0)*100);
    per2 = '';
    per3 = Math.round((rdata.lowTapePro-0)*100);
    pankou = rdata.ULTape;
  } else if(gameType == 'z_spf'){
    per1 = Math.round((rdata.SPFwinPro-0)*100);
    per2 = Math.round((rdata.SPFdrawPro-0)*100);
    per3 = Math.round((rdata.SPFlosePro-0)*100);
    pankou = '';
  } else  if(gameType == 'z_dx'){
    per1 = Math.round((rdata.DXbigPro-0)*100),
    per2 = '',
    per3 = Math.round((rdata.DXsmallPro-0)*100),
    pankou = rdata.DXTape;
  } else {
    per1 = Math.round((rdata.upperTapePro-0)*100);
    per2 = '';
    per3 = Math.round((rdata.lowTapePro-0)*100);
    pankou = rdata.ULTape;
  }

  var cdata = match_data.data[$('#smart_'+matchId).data("idx")];
  cdata.per1 = per1 +'%';
  cdata.per2 = per2 +'%';
  cdata.per3 = per3 +'%';
  cdata.pankou = pankou;
  // render 显示盘口分数和比分条
  html = template('smart_match_in_'+gameType+'_tmp', {data: cdata});
  $('#smart_'+matchId)[0].innerHTML = html;

  // 获取dom元素
  var $databox = $('#smart_data_' + matchId);
  $databox.html(dataTmp(per1,per2,per3,gameType));
} 
// 渲染预测render_smart_end 赛后
function render_smart_end(data){
  //赛后
  // 隐藏弹出层
  popupHide();
  var matchId = data.matchId;
  var gameType = data.gameType;
  var rdata = data.om;

  // 'upperTapePro':0.35,//'上盘概率'
  // 'lowTapePro':0.35, //'下盘概率'
  // 'ULTape':2.5, //'上下盘盘口'
  // 'DXbigPro' :0.35, //'大分概率'
  // 'DXsmallPro':0.35, //'小分概率'
  // 'DXTape' :3.5/4 '大小分盘口'
  // 'SPFwinPro' :0.35, //'胜平负胜率'
  // 'SPFdrawPro' :0.35,//'胜平负平率'
  // 'SPFlosePro' :0.35, //'胜平负负率'
  // "ULforecastResult":1, //0（未给出结果），2（错），1（准）3(走)
  // "SPFforecastResult":2, //0（未给出结果），2（错），1（准）3(走)
  // "DXforecastResult":1, //0（未给出结果），2（错），1（准）3(走)
  // "matchStatus":3  //1(未赛)，2（赛中），3（完赛）
  var per1,per2,per3,pankou,forecast;
  var FORECASTRESULT = ['','smart_mc_win','smart_mc_lose','smart_mc_zou'];
  if(gameType == 'z_sx'){
    per1 = Math.round((rdata.upperTapePro-0)*100);
    per2 = '';
    per3 = Math.round((rdata.lowTapePro-0)*100);
    pankou = rdata.ULTape;
    forecast = FORECASTRESULT[rdata.ULforecastResult];
  } else if(gameType == 'z_spf'){
    per1 = Math.round((rdata.SPFwinPro-0)*100);
    per2 = Math.round((rdata.SPFdrawPro-0)*100);
    per3 = Math.round((rdata.SPFlosePro-0)*100);
    pankou = '';
    forecast = FORECASTRESULT[rdata.SPFforecastResult];
  } else  if(gameType == 'z_dx'){
    per1 = Math.round((rdata.DXbigPro-0)*100),
    per2 = '',
    per3 = Math.round((rdata.DXsmallPro-0)*100),
    pankou = rdata.DXTape;
    forecast = FORECASTRESULT[rdata.DXforecastResult];
  } else {
    per1 = Math.round((rdata.upperTapePro-0)*100);
    per2 = '';
    per3 = Math.round((rdata.lowTapePro-0)*100);
    pankou = ULTape;
    forecast = FORECASTRESULT[rdata.ULforecastResult];
  }

  var cdata = match_data.data[$('#smart_'+matchId).data("idx")];
  cdata.per1 = per1 +'%';
  cdata.per2 = per2 +'%';
  cdata.per3 = per3 +'%';
  cdata.pankou = pankou;
  cdata.forecast = forecast;

  // render 显示盘口分数和比分条
  html = template('smart_match_end_'+gameType+'_tmp', {data: cdata});
  $('#smart_'+matchId)[0].innerHTML = html;

  // 获取dom元素
  var $databox = $('#smart_data_' + matchId);
  $databox.html(dataTmp(per1,per2,per3,gameType));
}
// 比分条模板
function dataTmp(per1,per2,per3,gameType) {
  var _hm = "";
  if(gameType == 'z_spf'){
    _hm+='<div class="smart_spf_s"></div>';
    if(per2>0){
      var pw = Math.round(266*(per2+per3)/100);
      _hm+=('<div class="smart_spf_p">\
          <div class="smart_spf_pr"></div>\
          <div class="smart_spf_pc" style="width:'+pw+'px"></div>\
          <div class="smart_spf_pl"></div>\
        </div>');
      if(per3>0){
        var fw = Math.round(266*per3/100);
        _hm+=('<div class="smart_spf_f">\
            <div class="smart_spf_fr"></div>\
            <div class="smart_spf_fc" style="width:'+fw+'px"></div>\
            <div class="smart_spf_fl"></div>\
          </div>');
      }
    }
    _hm+=('<div class="smart_spf_info">\
        <div class="smart_spf_win"><em>'+per1+'%</em>胜</div>\
        <div class="smart_spf_draw"><em>'+per2+'%</em>平</div>\
        <div class="smart_spf_lose"><em>'+per3+'%</em>负</div>\
      </div>');
  } else {
    _hm+='<div class="smart_percent_red"></div>';
    if(per3>0){
      var pw = Math.round(266*per3/100);
      _hm+=('<div class="smart_percent_blue">\
          <div class="smart_percent_br"></div>\
          <div class="smart_percent_bc" style="width:'+pw+'px"></div>\
          <div class="smart_percent_bl"></div>\
        </div>');
    }
  }
  
  // var gp=50%;
  // if(hostPro<=0){ $percent_blue.hide();}
  // var pw = Math.round(260*gp/100);
  // $percent_bc.width(pw);
  // $toggle_next.show();
  return _hm;
}

// 转发到用户中心注册页面
function registerForm(wbId, nick, wbType) {
  var actionUrl = baseurl+'/uc/register/bindPhone';
  var turnForm = document.createElement("form");
  //一定要加入到body中！！
  document.body.appendChild(turnForm);
  turnForm.method = 'post';
  turnForm.action = actionUrl;
  turnForm.id = 'jq_tmp_form';
  turnForm.target = '_blank';
  //创建隐藏表单
  var input1 = document.createElement("input");
  input1.setAttribute("name", "thirdId");
  input1.setAttribute("type", "hidden");
  input1.setAttribute("value", wbId);
  turnForm.appendChild(input1);

  //创建隐藏表单
  var input2 = document.createElement("input");
  input2.setAttribute("name", "thirdType");
  input2.setAttribute("type", "hidden");
  input2.setAttribute("value", wbType);
  turnForm.appendChild(input2);

  var input3 = document.createElement("input");
  input3.setAttribute("name", "nickName");
  input3.setAttribute("type", "hidden");
  input3.setAttribute("value", nick);
  turnForm.appendChild(input3);

  turnForm.submit();
  document.body.removeChild(turnForm);
}



// 数据页面支付模块
var payforGun = function (cdata) {
  window.mdinfo = cdata;
  window.$mask = $("#mask"); 
  // 所有弹出层容器
  window.$popup_box = $(".popup_box");
  // 支付容器
  window.$popup = $("#popup_layout_pay");
  // 支付应该成功容器
  window.$popup_canpay = $("#popup_layout_canpay");
  // 未支付容器
  window.$popup_nopay = $("#popup_layout_nopay");
  // 没有预测数据的提示容器
  window.$popup_msg = $("#popup_layout_msg");
  // event
  var $tips = $(".md_tips");
  function mdEvent(){
    $("#modelData").on("mouseenter",".md_btn_purchase_no",function(evt){
      $tips.show();
    });
    $("#modelData").on("mouseleave",".md_btn_purchase_no",function(){
      $tips.hide();
    });
    // 支付逻辑
    // 弹层层隐藏按钮
    $(".popup_btn_close").on("click", function(){
      // 隐藏弹出层
      popupHide();
    });

    $("#modelData").on("click", ".md_btn_purchase", function(){
      //判断登录状态
      var isLogin = checkLogin();
      if(!isLogin){
        middleLogin();
      }else{
        //发起订单和充值请求,查看数据详情
        var matchId = $(this).data("id");
        var gameType = $(this).data("type");
        var pankou = $(this).data("pankou");
        var hostTeam = $(this).data("home");;
        var awayTeam = $(this).data("guest");;
        var matchTime = $(this).data("date");;
        // console.log(util.wbId+";"+matchId+";"+gameType+";"+pankou+";"+hostTeam+";"+awayTeam+";"+matchTime);
        // 获取信息
        util.payment.payStep1(null, matchId, gameType, pankou, hostTeam, awayTeam, matchTime, true);
      }
    });

    //弹出层 支付按钮
    $(".popup_btn_pay").click(function() {
      // 先验证是否存在订单号
      util.payment.payStep2(util.wbId, euro_matchid, euro_gameType, euro_pankou);
    });

    //提示信息按钮:知道了  取消
    $(".popup_btn_know").on('click', function(event) {
      // 隐藏弹出层
      popupHide();
    });
    $(".popup_btn_cancel").on('click', function(event) {
      // 隐藏弹出层
      popupHide();
    });

    //支付成功确认
    $(".popup_btn_canpay").on('click',function() {
      // 隐藏弹出层
      popupHide();
      // 支付是否成功验证
      util.payment.payStep5(euro_orderid,euro_memberid,euro_matchid,euro_gameType, true);
    });
  }
  mdEvent();

  document.onmousemove = function(evt){
    var oEvent = evt || window.event;
    var scrollleft = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrolltop = document.documentElement.scrollTop || document.body.scrollTop;
    $tips[0].style.left = oEvent.clientX + scrollleft +10 +"px";
    $tips[0].style.top = oEvent.clientY + scrolltop + 10 + "px";
  }

  // console.log(cdata);
  var matchId= cdata.livecast_id;
  getMdData(matchId);
}

function getMdData(matchId){
  var cdata = window.mdinfo;
  if(!cdata){ return;}
  $.ajax({
    url:'http://odds.sports.sina.com.cn/odds/uefa/getOpenedMatchForecast?matchId='+matchId+'&format=json',
    dataType:'jsonp',
    data: {},
    cache: true,
    jsonpCallback:"getOpenedMatchForecast_"+matchId,
    type:"get",
    success: function(data) {
      // data = {
      //     "result":  {
      //       "status":  {
      //         "code": 0,
      //         "msg": ""
      //       },
      //       "matchId":519526,
      //       'ULswitch':1, //'0 不可购买 1可以购买'
      //       'SPFswitch':1, //'0 不可购买 1可以购买'
      //       'DXswitch':1, //'0 不可购买 1可以购买'
      //       'ULTape': '平手',
      //       'DXTape': "1.5/2球",
      //       "matchStatus":"1",//枚举：1（未赛），2（赛中），3（完赛）
      //       "data": {
      //         'upperTapePro':0.35,//'上盘概率'
      //         'lowTapePro':0.65, //'下盘概率'
      //         'ULTape':2.5, //'上下盘盘口'
      //         'DXbigPro' :0.35, //'大分概率'
      //         'DXsmallPro':0.35, //'小分概率'
      //         'DXTape' :3.5/4,// '大小分盘口'
      //         'SPFwinPro' :0.35, //'胜平负胜率'
      //         'SPFdrawPro' :0.25,//'胜平负平率'
      //         'SPFlosePro' :0.40, //'胜平负负率'
      //         "awayScore": 0,
      //         "hostScore": 0,
      //         "matchStatus":"1",//枚举：1（未赛），2（赛中），3（完赛）
      //         "ULforecastResult": 0,//枚举：0（无结果），1（准），2（错）
      //         "SPFforecastResult":0,//枚举：0（无结果），1（准），2（错）
      //         "DXforecastResult":0,//枚举：0（无结果），1（准），2（错）
      //       }
      //     }
      //   }
      cdata.om = data.result.data;
      cdata.ULswitch = data.result.ULswitch;
      cdata.SPFswitch = data.result.SPFswitch;
      cdata.DXswitch = data.result.DXswitch;
      cdata.ULTape = data.result.ULTape;
      cdata.DXTape = data.result.DXTape;

      cdata.ULTape_cn = data.result.ULTape_cn;
      cdata.DXTape_cn = data.result.DXTape_cn;

      var rdata = cdata.om;
      cdata.matchId = matchId;
      // console.log(cdata);
      
      // "matchStatus" 1（未赛），2（赛中），3（完赛）
      // render
      if(rdata.matchStatus == 1){
        // 先渲染购买前
        render_md_pre(cdata);
        // 判断是否已经购买过了  
        if(util.payment.getwbid()){
          util.payment.payStep10(util.wbId, matchId, [cdata.ULswitch,cdata.SPFswitch,cdata.DXswitch]);
        }
      } else if(rdata.matchStatus == 2 || rdata.matchStatus == 3){
        // 赛中 赛后
        render_md_in(cdata);
      } else {
        // 先渲染购买前
        render_md_pre(cdata);
        // 判断是否已经购买过了  
        if(util.payment.getwbid()){
          util.payment.payStep10(util.wbId, matchId, [cdata.ULswitch,cdata.SPFswitch,cdata.DXswitch]);
        }
      }
    }
  });
}

var render_md_pre = function(cdata){
  var sx_switch = (cdata.ULswitch == 1)?'':'no_',
      spf_switch = (cdata.SPFswitch == 1)?'':'no_',
      dx_switch = (cdata.DXswitch == 1)?'':'no_';
  
  var $sx=$("#md_sx"),$spf=$("#md_spf"),$dx=$("#md_dx");
  var sx_html = template('md_match_pre_z_sx_'+sx_switch+'tmp', {data: cdata});
  var spf_html = template('md_match_pre_z_spf_'+spf_switch+'tmp', {data: cdata});
  var dx_html = template('md_match_pre_z_dx_'+dx_switch+'tmp', {data: cdata});
  $sx[0].innerHTML = sx_html;
  $spf[0].innerHTML = spf_html;
  $dx[0].innerHTML = dx_html;
}
// 渲染预测render_md_in 赛中
var render_md_in = function(data){
  //赛中 赛后
  // 隐藏弹出层
  popupHide();
  var matchId = data.matchId;
  var rdata = data.om;
  // 'upperTapePro':0.35,//'上盘概率'
  // 'lowTapePro':0.35, //'下盘概率'
  // 'ULTape':2.5, //'上下盘盘口'
  // 'DXbigPro' :0.35, //'大分概率'
  // 'DXsmallPro':0.35, //'小分概率'
  // 'DXTape' :3.5/4 '大小分盘口'
  // 'SPFwinPro' :0.35, //'胜平负胜率'
  // 'SPFdrawPro' :0.35,//'胜平负平率'
  // 'SPFlosePro' :0.35, //'胜平负负率'
  var cdata = data;
  cdata.sx_per1 = Math.round((rdata.upperTapePro-0)*100);
  cdata.sx_per2 = '';
  cdata.sx_per3 = Math.round((rdata.lowTapePro-0)*100);
  cdata.sx_pankou = data.ULTape;
  cdata.sx_pankou_cn = data.ULTape_cn;
  cdata.sx_pw = Math.round(226*cdata.sx_per3/100);

  cdata.spf_per1 = Math.round((rdata.SPFwinPro-0)*100);
  cdata.spf_per2 = Math.round((rdata.SPFdrawPro-0)*100);
  cdata.spf_per3 = Math.round((rdata.SPFlosePro-0)*100);
  cdata.spf_pankou = '';
  cdata.spf_pw = Math.round(226*(cdata.spf_per2+cdata.spf_per3)/100);
  cdata.spf_pw1 = Math.round(226*cdata.spf_per3/100);
 
  cdata.dx_per1 = Math.round((rdata.DXbigPro-0)*100),
  cdata.dx_per2 = '',
  cdata.dx_per3 = Math.round((rdata.DXsmallPro-0)*100),
  cdata.dx_pankou = data.DXTape;
  cdata.dx_pankou_cn = data.DXTape_cn;
  cdata.dx_pw = Math.round(226*cdata.dx_per3/100);
  
  html = template('md_match_in_z_sx_tmp', {data: cdata});
  $("#md_sx")[0].innerHTML = html;

  html = template('md_match_in_z_spf_tmp', {data: cdata});
  $("#md_spf")[0].innerHTML = html;

  html = template('md_match_in_z_dx_tmp', {data: cdata});
  $("#md_dx")[0].innerHTML = html;
}

// 渲染预测render_md_haspay  赛前购买后
var render_md_haspay = function(data){
    //已购买成功和已开赛 已结束的比赛
    // 隐藏弹出层
    popupHide();
    var matchId = data.matchId;
    var gameType = data.gameType;
    var cdata = data.data;

    if(gameType == 'z_sx'){
      if(cdata.hostWinPro == ''){
        cdata.nodata = '智能数据正在分析中';
        html = template('md_match_pre_z_sx_analysis_tmp', {data: cdata});
        $("#md_sx")[0].innerHTML = html;
        return;
      }
      cdata.sx_per1 = Math.round((cdata.hostWinPro-0)*100);
      cdata.sx_per2 = '';
      cdata.sx_per3 = Math.round((cdata.awayWinPro-0)*100);
      cdata.sx_pankou = cdata.pankou;
      cdata.sx_pankou_cn = cdata.pankou_cn;
      cdata.sx_pw = Math.round(226*cdata.sx_per3/100);
      html = template('md_match_pre_z_sx_haspay_tmp', {data: cdata});
      $("#md_sx")[0].innerHTML = html;
    } else if(gameType == 'z_spf'){
      if(cdata.hostWinPro == ''){
        cdata.nodata = '智能数据正在分析中';
        html = template('md_match_pre_z_spf_analysis_tmp', {data: cdata});
        $("#md_spf")[0].innerHTML = html;
        return;
      }
      cdata.spf_per1 = Math.round((cdata.hostWinPro-0)*100);
      cdata.spf_per2 = Math.round((cdata.pinWinPro-0)*100);
      cdata.spf_per3 = Math.round((cdata.awayWinPro-0)*100);
      cdata.spf_pankou = '';
      cdata.spf_pw = Math.round(226*(cdata.spf_per2+cdata.spf_per3)/100);
      cdata.spf_pw1 = Math.round(226*cdata.spf_per3/100);
      html = template('md_match_pre_z_spf_haspay_tmp', {data: cdata});
      $("#md_spf")[0].innerHTML = html;
    } else if(gameType == 'z_dx'){
      if(cdata.hostWinPro == ''){
        cdata.nodata = '智能数据正在分析中';
        html = template('md_match_pre_z_dx_analysis_tmp', {data: cdata});
        $("#md_dx")[0].innerHTML = html;
        return;
      }
      cdata.dx_per1 = Math.round((cdata.hostWinPro-0)*100),
      cdata.dx_per2 = '',
      cdata.dx_per3 = Math.round((cdata.awayWinPro-0)*100),
      cdata.dx_pankou = cdata.pankou;
      cdata.dx_pankou_cn = cdata.pankou_cn;
      cdata.dx_pw = Math.round(226*cdata.dx_per3/100);
      html = template('md_match_pre_z_dx_haspay_tmp', {data: cdata});
      $("#md_dx")[0].innerHTML = html;
    } else{
      if(cdata.hostWinPro == ''){
        cdata.nodata = '智能数据正在分析中';
        html = template('md_match_pre_z_sx_analysis_tmp', {data: cdata});
        $("#md_sx")[0].innerHTML = html;
        return;
      }
      cdata.sx_per1 = Math.round((cdata.hostWinPro-0)*100);
      cdata.sx_per2 = '';
      cdata.sx_per3 = Math.round((cdata.awayWinPro-0)*100);
      cdata.sx_pankou = cdata.pankou;
      cdata.sx_pankou_cn = cdata.pankou_cn;
      cdata.sx_pw = Math.round(226*cdata.sx_per3/100);
      html = template('md_match_pre_z_sx_haspay_tmp', {data: cdata});
      $("#md_sx")[0].innerHTML = html;
    }
  }
