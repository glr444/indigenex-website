#!/bin/bash
# 服务器检查修复脚本 - 在服务器上执行

echo "=== 服务器部署检查与修复 ==="

# 1. 检查PM2状态
echo ""
echo "[1/5] PM2服务状态:"
pm2 status

# 2. 检查目录
echo ""
echo "[2/5] 项目目录检查:"
if [ -d "/var/www/indigenex-website/frontend" ]; then
    cd /var/www/indigenex-website/frontend
    echo "✅ 目录存在"
    echo "目录权限:"
    ls -la | head -5
else
    echo "❌ 目录不存在"
fi

# 3. 检查构建产物
echo ""
echo "[3/5] 构建产物检查:"
if [ -d ".next" ]; then
    echo "✅ .next目录存在"
    echo "构建时间:"
    stat -c %y .next/server/app/page.js 2>/dev/null || echo "无法获取"
else
    echo "❌ .next目录不存在，需要重新构建"
fi

# 4. 检查node_modules
echo ""
echo "[4/5] node_modules检查:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules存在"
    # 检查是否有darwin模块（跨平台问题）
    if ls node_modules/@next/swc-darwin* 1>/dev/null 2>&1; then
        echo "⚠️ 警告: 发现Mac模块(darwin)，需要删除重装"
        echo "执行: rm -rf node_modules && npm install"
    else
        echo "✅ 未发现Mac模块"
    fi
else
    echo "❌ node_modules不存在"
fi

# 5. 端口检查
echo ""
echo "[5/5] 端口监听检查:"
netstat -tlnp 2>/dev/null | grep -E '3000|5001' || ss -tlnp 2>/dev/null | grep -E '3000|5001' || echo "未检测到3000/5001端口监听"

echo ""
echo "=== 检查完成 ==="

# 如果发现问题，提供修复选项
echo ""
echo "如需修复，请执行以下命令:"
echo ""
echo "# 停止所有服务"
echo "pm2 delete all"
echo ""
echo "# 清理并重新安装"
echo "cd /var/www/indigenex-website/frontend"
echo "rm -rf node_modules .next"
echo "npm install"
echo "npm run build"
echo ""
echo "# 启动服务"
echo "PORT=3000 pm2 start npm --name 'indigenex-frontend' -- start"
echo "pm2 save"
