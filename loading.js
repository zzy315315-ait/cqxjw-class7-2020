// ============================================================
// 科技感加载页面 + 人机验证系统
// ============================================================

var LoadingSystem = (function(){
  // 检测项目列表
  var CHECKS = [
    "检测IP纯净度中...",
    "验证网络环境中...",
    "加载安全证书中...",
    "初始化数据库连接中...",
    "验证用户身份中...",
    "扫描恶意代码中...",
    "加载班级数据中...",
    "同步服务器时间中...",
    "检查系统完整性中...",
    "准备登录界面中..."
  ];

  var isLoading = true;
  var ddosBlocked = false;

  // 初始化
  function init(){
    // 检查DDoS防护
    if(checkDDoS()){
      showCaptcha("ddos");
      return;
    }

    // 5%概率触发人机验证
    if(Math.random() < 0.05){
      showCaptcha("random");
      return;
    }

    // 正常加载
    startLoading();
  }

  // DDoS防护检查
  function checkDDoS(){
    var now = Date.now();
    var records = JSON.parse(localStorage.getItem('ddos_records') || '[]');
    // 只保留一分钟内的记录
    records = records.filter(function(t){ return now - t < 60000; });
    records.push(now);
    localStorage.setItem('ddos_records', JSON.stringify(records));
    // 一分钟内超过5次，判定为DDoS
    return records.length > 5;
  }

  // 开始加载
  function startLoading(){
    var screen = document.getElementById('loadingScreen');
    var countdown = document.getElementById('loadingCountdown');
    var status = document.getElementById('loadingStatus');
    var checksContainer = document.getElementById('loadingChecks');
    var progressBar = document.getElementById('loadingProgressBar');

    if(!screen) return;
    screen.classList.remove('hidden');

    // 随机选择5个检测项目会卡1-2秒，其他0.5秒
    var slowIndices = [];
    while(slowIndices.length < 5){
      var idx = Math.floor(Math.random() * 10);
      if(slowIndices.indexOf(idx) === -1) slowIndices.push(idx);
    }

    // 创建检测项目
    checksContainer.innerHTML = '';
    var checkElements = [];
    CHECKS.forEach(function(text, i){
      var div = document.createElement('div');
      div.className = 'loading-check';
      div.innerHTML = '<span class="icon">○</span><span class="text">' + text + '</span>';
      checksContainer.appendChild(div);
      checkElements.push(div);
    });

    // 十步倒计时
    var count = 10;
    countdown.textContent = count;
    var totalTime = 10000; // 10秒
    var startTime = Date.now();

    // 进度条
    var progressInterval = setInterval(function(){
      var elapsed = Date.now() - startTime;
      var progress = Math.min(elapsed / totalTime * 100, 100);
      progressBar.style.width = progress + '%';
    }, 50);

    // 逐个完成检测项目
    var checkIndex = 0;
    function nextCheck(){
      if(checkIndex >= 10){
        // 所有检测完成，等待倒计时结束
        return;
      }
      var el = checkElements[checkIndex];
      var text = CHECKS[checkIndex];
      el.classList.add('active');
      status.textContent = text;

      var delay = slowIndices.indexOf(checkIndex) >= 0 ? (1000 + Math.random() * 1000) : 500;

      setTimeout(function(){
        el.classList.remove('active');
        el.classList.add('done');
        el.querySelector('.icon').textContent = '✓';
        checkIndex++;
        nextCheck();
      }, delay);
    }
    nextCheck();

    // 倒计时
    var countdownInterval = setInterval(function(){
      count--;
      countdown.textContent = count;
      if(count <= 0){
        clearInterval(countdownInterval);
        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        status.textContent = '加载完成！';
        setTimeout(function(){
          screen.classList.add('hidden');
          isLoading = false;
        }, 500);
      }
    }, 1000);
  }

  // 显示人机验证
  function showCaptcha(type){
    var screen = document.getElementById('captchaScreen');
    var desc = document.getElementById('captchaDesc');
    var longPressSection = document.getElementById('captchaLongPressSection');
    var imageSection = document.getElementById('captchaImageSection');

    if(!screen) return;
    screen.classList.add('show');

    if(type === "ddos"){
      desc.textContent = '检测到频繁访问，我们怀疑你是机器人。请完成人机验证以继续访问。';
    }else{
      desc.textContent = '为了确保网站安全，请完成人机验证以继续访问。';
    }

    // 第一步：长按验证
    longPressSection.style.display = 'block';
    imageSection.style.display = 'none';
    setupLongPress();
  }

  // 设置长按验证
  function setupLongPress(){
    var btn = document.getElementById('captchaLongPress');
    var progress = document.getElementById('captchaLongPressProgress');
    var error = document.getElementById('captchaError');
    var pressing = false;
    var pressStart = 0;
    var pressInterval = null;
    var requiredTime = 2000; // 需要长按2秒

    function startPress(e){
      e.preventDefault();
      pressing = true;
      pressStart = Date.now();
      error.textContent = '';
      pressInterval = setInterval(function(){
        var elapsed = Date.now() - pressStart;
        var percent = Math.min(elapsed / requiredTime * 100, 100);
        progress.style.width = percent + '%';
        if(elapsed >= requiredTime){
          clearInterval(pressInterval);
          pressing = false;
          // 长按成功，进入图片验证
          setTimeout(showImageCaptcha, 300);
        }
      }, 50);
    }

    function endPress(){
      if(!pressing) return;
      pressing = false;
      clearInterval(pressInterval);
      var elapsed = Date.now() - pressStart;
      if(elapsed < requiredTime){
        progress.style.width = '0%';
        error.textContent = '长按时间不足，请重试';
      }
    }

    btn.addEventListener('mousedown', startPress);
    btn.addEventListener('mouseup', endPress);
    btn.addEventListener('mouseleave', endPress);
    btn.addEventListener('touchstart', startPress);
    btn.addEventListener('touchend', endPress);
  }

  // 显示图片验证
  function showImageCaptcha(){
    var longPressSection = document.getElementById('captchaLongPressSection');
    var imageSection = document.getElementById('captchaImageSection');
    var imagesContainer = document.getElementById('captchaImages');
    var submitBtn = document.getElementById('captchaSubmit');
    var error = document.getElementById('captchaImageError');

    longPressSection.style.display = 'none';
    imageSection.style.display = 'block';

    // 生成9张图片（用颜色块代替，实际可以用真实图片）
    var images = [];
    var correctCount = Math.floor(Math.random() * 3) + 2; // 2-4张正确答案
    for(var i = 0; i < 9; i++){
      images.push({
        id: i,
        isCorrect: i < correctCount,
        color: i < correctCount ? '#4a90ff' : '#2a2a3e'
      });
    }
    // 打乱顺序
    images.sort(function(){ return Math.random() - 0.5; });

    var selected = [];
    imagesContainer.innerHTML = '';
    images.forEach(function(img){
      var div = document.createElement('div');
      div.className = 'captcha-img';
      div.dataset.id = img.id;
      div.dataset.correct = img.isCorrect;
      div.innerHTML = '<div style="width:100%;height:100%;background:' + img.color + ';display:flex;align-items:center;justify-content:center;font-size:24px;">' + (img.isCorrect ? '🏫' : '🌳') + '</div><div class="check">✓</div>';
      div.addEventListener('click', function(){
        var id = parseInt(this.dataset.id);
        var idx = selected.indexOf(id);
        if(idx >= 0){
          selected.splice(idx, 1);
          this.classList.remove('selected');
        }else{
          selected.push(id);
          this.classList.add('selected');
        }
        submitBtn.disabled = selected.length === 0;
      });
      imagesContainer.appendChild(div);
    });

    submitBtn.onclick = function(){
      var correct = true;
      var allImgs = imagesContainer.querySelectorAll('.captcha-img');
      allImgs.forEach(function(img){
        var isSelected = img.classList.contains('selected');
        var isCorrect = img.dataset.correct === 'true';
        if(isSelected !== isCorrect){
          correct = false;
        }
      });

      if(correct){
        error.textContent = '';
        // 验证成功，开始加载
        document.getElementById('captchaScreen').classList.remove('show');
        startLoading();
      }else{
        error.textContent = '验证失败，请重试';
        // 重置选择
        selected = [];
        allImgs.forEach(function(img){ img.classList.remove('selected'); });
        submitBtn.disabled = true;
      }
    };
  }

  return {
    init: init,
    isLoading: function(){ return isLoading; }
  };
})();

// 页面加载完成后初始化
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ LoadingSystem.init(); });
}else{
  LoadingSystem.init();
}
