// ============================================================
// 公共工具函数 - 所有页面共享
// 包含：escapeHtml、showToast、登录状态检测、goBack等
// ============================================================

// HTML转义，防止XSS
function escapeHtml(str){
  if(str == null) return '';
  var div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// Toast弹窗提示
function showToast(msg, type){
  type = type || 'info';
  var t = document.getElementById('toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:12px;font-size:14px;z-index:99999;opacity:0;transition:all .3s;pointer-events:none;backdrop-filter:blur(10px);';
    document.body.appendChild(t);
  }
  var colors = {
    success: 'background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3);',
    error: 'background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);',
    info: 'background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.3);',
    warn: 'background:rgba(234,179,8,0.15);color:#facc15;border:1px solid rgba(234,179,8,0.3);'
  };
  t.style.cssText += colors[type] || colors.info;
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(function(){
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(-10px)';
  }, 2500);
}

// 获取当前登录用户
function getCurrentUser(){
  try{
    var sess = JSON.parse(localStorage.getItem('sb_session') || sessionStorage.getItem('sb_session') || 'null');
    var adm = JSON.parse(localStorage.getItem('sb_admin') || 'null');
    return sess || adm;
  }catch(e){
    return null;
  }
}

// 判断是否管理员（用UID白名单）
function isAdminUser(){
  var user = getCurrentUser();
  if(user && user.uid && CONFIG && CONFIG.ADMIN_UIDS){
    return CONFIG.ADMIN_UIDS.indexOf(user.uid.toLowerCase()) >= 0;
  }
  return false;
}

// 判断是否访客模式
function isVisitorMode(){
  return sessionStorage.getItem('mode') === 'visitor';
}

// 防直达检测：未登录跳回登录页
function requireLogin(){
  var ok = false;
  if(sessionStorage.getItem('logged_in')) ok = true;
  else if(localStorage.getItem('logged_in')){
    var exp = parseInt(localStorage.getItem('login_expire') || '0');
    if(Date.now() < exp){
      ok = true;
      sessionStorage.setItem('logged_in', '1');
    }else{
      localStorage.removeItem('logged_in');
      localStorage.removeItem('login_expire');
      localStorage.removeItem('sb_session');
    }
  }
  if(!ok){
    window.location.href = CONFIG ? CONFIG.PAGES.login : 'login.html';
    return false;
  }
  return true;
}

// 防直达检测：管理员页面
function requireAdmin(){
  if(!requireLogin()) return false;
  if(!isAdminUser()){
    showToast('需要管理员权限', 'error');
    setTimeout(function(){
      window.location.href = CONFIG ? CONFIG.PAGES.login : 'login.html';
    }, 1500);
    return false;
  }
  return true;
}

// 退出登录（清除所有用户信息）
function logout(){
  // 保留验证状态_v，避免重新触发人机验证
  var _v = sessionStorage.getItem('_v');
  
  // 清除sessionStorage中的所有用户信息
  sessionStorage.clear();
  if(_v) sessionStorage.setItem('_v', _v);
  
  // 清除localStorage中的所有用户信息
  var keysToRemove = [
    'logged_in', 'login_expire', 'is_admin',
    'sb_session', 'sb_admin', 'sb_user',
    'visitor_verified', 'mode', 'visitor_from_login',
    'last_register_submit', 'last_ticket_submit',
    'current_language', 'bgm_muted', 'bgm_volume',
    'direct_access_count', 'direct_access_warned',
    'ddos_hits', 'ddos_blocked',
    'captcha_verified', 'captcha_attempts',
    'password_reset_attempts', 'password_reset_locked',
    'game_auth', 'game_user', 'game_token',
    'quiz_score', 'brick_score', 'quiz_completed', 'brick_completed',
    'last_message_post', 'message_draft',
    'settings_cache', 'profile_cache',
    'feedback_cache', 'ticket_cache'
  ];
  
  keysToRemove.forEach(function(key){
    try{ localStorage.removeItem(key); }catch(e){}
  });
  
  // 清除所有以sb_开头的localStorage项
  for(var i = localStorage.length - 1; i >= 0; i--){
    var key = localStorage.key(i);
    if(key && (key.indexOf('sb_') === 0 || key.indexOf('user_') === 0 || key.indexOf('auth_') === 0 || key.indexOf('token_') === 0)){
      localStorage.removeItem(key);
    }
  }
  
  // 清除背景音乐状态
  if(window.BGM && typeof BGM.clearAllState === 'function'){
    BGM.clearAllState();
  }
  
  showToast('已退出登录，所有用户信息已清除', 'success');
  setTimeout(function(){
    window.location.href = 'login.html';
  }, 800);
}

// 返回按钮：根据登录状态和访客模式自动判断
function goBack(){
  if(isVisitorMode()){
    location.href = CONFIG ? CONFIG.PAGES.visitor : 'visitor.html';
  }else if(isAdminUser()){
    location.href = CONFIG ? CONFIG.PAGES.adminHome : 'admin-main.html';
  }else{
    location.href = CONFIG ? CONFIG.PAGES.userHome : 'a3x7k2m9p4q8r3t6w1y5u0i2o4.html';
  }
}

// Supabase REST API通用请求
function supabaseRequest(method, path, body){
  var url = CONFIG.SUPABASE_URL + path;
  var data = body ? JSON.stringify(body) : null;
  return new Promise(function(resolve){
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('apikey', CONFIG.ANON_KEY);
    xhr.setRequestHeader('Authorization', 'Bearer ' + CONFIG.ANON_KEY);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function(){
      try{
        resolve({ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data: JSON.parse(xhr.responseText)});
      }catch(e){
        resolve({ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data: xhr.responseText});
      }
    };
    xhr.onerror = function(){
      resolve({ok: false, status: 0, data: '网络错误'});
    };
    xhr.send(data);
  });
}

// 禁止文字选中和图片拖动
function disableSelection(){
  document.addEventListener('selectstart', function(e){
    if(e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA'){
      e.preventDefault();
    }
  });
  document.addEventListener('dragstart', function(e){
    if(e.target.tagName === 'IMG'){
      e.preventDefault();
    }
  });
}

// 页面加载完成后自动执行
document.addEventListener('DOMContentLoaded', function(){
  disableSelection();
});
