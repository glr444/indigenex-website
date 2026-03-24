const nodemailer = require('nodemailer');

// 创建邮件传输器
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * 发送会员开通通知邮件
 *
 * @param {Object} options - 邮件选项
 * @param {string} options.to - 收件人邮箱
 * @param {string} options.companyName - 企业名称
 * @param {string} options.contactName - 联系人姓名
 * @param {string} options.password - 临时密码
 * @param {string} options.loginUrl - 登录地址
 * @returns {Promise} - 发送结果
 */
async function sendMemberApprovalEmail({ to, companyName, contactName, password, loginUrl }) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || '"大掌柜业务门户" <noreply@example.com>';

  const subject = '【大掌柜业务门户】您的账户已开通';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #007AFF, #0055D4); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
    .info-box { background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .info-row { display: flex; margin: 10px 0; }
    .info-label { font-weight: 600; width: 100px; color: #666; }
    .info-value { flex: 1; color: #333; }
    .password { font-size: 20px; font-weight: 700; color: #007AFF; letter-spacing: 2px; }
    .button { display: inline-block; background: linear-gradient(135deg, #007AFF, #0055D4); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>欢迎加入大掌柜业务门户</h1>
    </div>
    <div class="content">
      <p>尊敬的 ${contactName}，您好！</p>
      <p>您的企业账户已通过审核并正式开通，欢迎开始使用大掌柜业务门户服务。</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">企业名称：</span>
          <span class="info-value">${companyName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">登录邮箱：</span>
          <span class="info-value">${to}</span>
        </div>
        <div class="info-row">
          <span class="info-label">初始密码：</span>
          <span class="info-value password">${password}</span>
        </div>
      </div>

      <p style="color: #FF3B30; font-size: 14px;">
        <strong>安全提示：</strong>请尽快登录系统修改初始密码，确保账户安全。
      </p>

      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">立即登录</a>
      </div>

      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        登录地址：${loginUrl}
      </p>
    </div>
    <div class="footer">
      <p>此邮件由系统自动发送，请勿回复</p>
      <p>© 2026 大掌柜业务门户 版权所有</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
尊敬的 ${contactName}，您好！

您的企业账户已通过审核并正式开通。

账户信息：
- 企业名称：${companyName}
- 登录邮箱：${to}
- 初始密码：${password}

登录地址：${loginUrl}

安全提示：请尽快登录系统修改初始密码，确保账户安全。

此邮件由系统自动发送，请勿回复。
© 2026 大掌柜业务门户
  `;

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
}

/**
 * 发送密码重置邮件
 *
 * @param {Object} options - 邮件选项
 * @param {string} options.to - 收件人邮箱
 * @param {string} options.contactName - 联系人姓名
 * @param {string} options.resetToken - 重置令牌
 * @param {string} options.resetUrl - 重置密码地址
 * @returns {Promise} - 发送结果
 */
async function sendPasswordResetEmail({ to, contactName, resetToken, resetUrl }) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || '"大掌柜业务门户" <noreply@example.com>';

  const subject = '【大掌柜业务门户】密码重置';
  const fullResetUrl = `${resetUrl}?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #007AFF, #0055D4); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
    .button { display: inline-block; background: linear-gradient(135deg, #007AFF, #0055D4); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px; }
    .expiry { color: #FF3B30; font-size: 14px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>密码重置</h1>
    </div>
    <div class="content">
      <p>尊敬的 ${contactName}，您好！</p>
      <p>我们收到了您的密码重置请求。请点击下方按钮重置密码：</p>

      <div style="text-align: center;">
        <a href="${fullResetUrl}" class="button">重置密码</a>
      </div>

      <p class="expiry">此链接将在 24 小时后过期，请尽快操作。</p>

      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        如果按钮无法点击，请复制以下链接到浏览器打开：<br>
        ${fullResetUrl}
      </p>

      <p style="margin-top: 20px; font-size: 14px; color: #999;">
        如果您没有请求重置密码，请忽略此邮件。
      </p>
    </div>
    <div class="footer">
      <p>此邮件由系统自动发送，请勿回复</p>
      <p>© 2026 大掌柜业务门户 版权所有</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
尊敬的 ${contactName}，您好！

我们收到了您的密码重置请求。

请点击以下链接重置密码：
${fullResetUrl}

此链接将在 24 小时后过期，请尽快操作。

如果您没有请求重置密码，请忽略此邮件。

此邮件由系统自动发送，请勿回复。
© 2026 大掌柜业务门户
  `;

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
}

module.exports = {
  sendMemberApprovalEmail,
  sendPasswordResetEmail,
};
