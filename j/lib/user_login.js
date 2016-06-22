;(function(){
  util.loginSucc = function(){
    util.log("login success");
  };
  util.loginOut = function(){
    util.log("login out");
  };
  window.__SinaTopBar__.user.init(document.getElementById('SI_User'),{
    entry :'caitong',
    login_success:function(){
      util.loginSucc();
    },
    logout_success:function(){
      util.loginOut();
    }
  });
  var sinaLoginLayer = SINA_OUTLOGIN_LAYER;
  /* sinaLoginLayer.set('plugin', {
     qqLogin : false            
  }); */
  sinaLoginLayer.set('styles', {          
    marginLeft: '0px'
  });
  util.middleLogin = function(msg) {
    var UserPanel = SINA_USER_PANEL;
    UserPanel.setOutLoginMiddle();
    UserPanel.getOutLogin().show();
    // 可添加提示
    __SinaTopBar__.user.showTip(msg);
  }
  util.checkLogin = function() {
    if (sinaLoginLayer) {
      return sinaLoginLayer.isLogin();
    } 
    return false;
  }
})(jQuery,undefined);