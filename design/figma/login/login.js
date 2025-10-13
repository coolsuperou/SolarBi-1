// 密码显示/隐藏切换
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // 切换图标
    const eyeIcon = this.querySelector('svg');
    if (type === 'password') {
      // 显示眼睛图标
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `;
    } else {
      // 显示闭眼图标
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      `;
    }
  });
}

// 表单提交处理
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const account = document.getElementById('account').value.trim();
    const password = document.getElementById('password').value;
    
    // 基础验证
    if (!account) {
      showMessage('请输入账号', 'error');
      return;
    }
    
    if (!password) {
      showMessage('请输入密码', 'error');
      return;
    }
    
    if (password.length < 6) {
      showMessage('密码至少需要6个字符', 'error');
      return;
    }
    
    // 显示登录中状态
    const loginBtn = loginForm.querySelector('.login-btn');
    const originalText = loginBtn.querySelector('.btn-text').textContent;
    loginBtn.querySelector('.btn-text').textContent = '登录中...';
    loginBtn.disabled = true;
    loginBtn.style.opacity = '0.7';
    
    // 模拟登录请求
    setTimeout(() => {
      // 这里应该是实际的API调用
      console.log('登录信息:', { account, password });
      
      // 登录成功
      showMessage('登录成功！', 'success');
      
      // 重定向到主页面（这里可以修改为实际的跳转逻辑）
      setTimeout(() => {
        // window.location.href = '/dashboard';
        console.log('跳转到主页面');
      }, 1000);
      
      // 恢复按钮状态
      loginBtn.querySelector('.btn-text').textContent = originalText;
      loginBtn.disabled = false;
      loginBtn.style.opacity = '1';
    }, 1500);
  });
}

// 输入框焦点动画
const formInputs = document.querySelectorAll('.form-input');

formInputs.forEach(input => {
  input.addEventListener('focus', function() {
    this.parentElement.style.transform = 'translateY(-2px)';
  });
  
  input.addEventListener('blur', function() {
    this.parentElement.style.transform = 'translateY(0)';
  });
});

// 消息提示函数
function showMessage(message, type = 'info') {
  // 移除已存在的消息
  const existingMessage = document.querySelector('.toast-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // 创建新消息
  const messageDiv = document.createElement('div');
  messageDiv.className = `toast-message toast-${type}`;
  messageDiv.textContent = message;
  
  // 添加样式
  messageDiv.style.cssText = `
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    padding: 14px 24px;
    background: ${type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(34, 197, 94, 0.95)'};
    color: white;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;
  
  document.body.appendChild(messageDiv);
  
  // 显示动画
  setTimeout(() => {
    messageDiv.style.transform = 'translateX(-50%) translateY(0)';
    messageDiv.style.opacity = '1';
  }, 10);
  
  // 自动隐藏
  setTimeout(() => {
    messageDiv.style.transform = 'translateX(-50%) translateY(-100px)';
    messageDiv.style.opacity = '0';
    
    setTimeout(() => {
      messageDiv.remove();
    }, 400);
  }, 3000);
}


// 键盘快捷键：Enter键提交
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
    const submitBtn = document.querySelector('.login-btn');
    if (submitBtn && !submitBtn.disabled) {
      loginForm.dispatchEvent(new Event('submit'));
    }
  }
});

// 页面加载动画
window.addEventListener('load', function() {
  const loginCard = document.querySelector('.login-card');
  if (loginCard) {
    loginCard.style.animation = 'fadeInUp 0.8s ease-out';
  }
});

// 鼠标移动视差效果
document.addEventListener('mousemove', function(e) {
  const orbs = document.querySelectorAll('.orb');
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;
  
  orbs.forEach((orb, index) => {
    const speed = (index + 1) * 20;
    const x = (mouseX - 0.5) * speed;
    const y = (mouseY - 0.5) * speed;
    
    orb.style.transform = `translate(${x}px, ${y}px)`;
  });
});

// 输入框自动完成处理
const accountInput = document.getElementById('account');
if (accountInput) {
  accountInput.addEventListener('input', function() {
    // 可以在这里添加自动完成逻辑
    console.log('Account input:', this.value);
  });
}

// 防止重复提交
let isSubmitting = false;

if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    if (isSubmitting) {
      e.preventDefault();
      return;
    }
    isSubmitting = true;
    
    setTimeout(() => {
      isSubmitting = false;
    }, 2000);
  });
}

console.log('登录页面已加载完成');



