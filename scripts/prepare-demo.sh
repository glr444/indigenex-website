#!/bin/bash
# 创建演示版（销售展示用）
# 此脚本会创建一个干净的 demo 分支，移除敏感信息

set -e

echo "=============================================="
echo "  创建演示版分支（用于销售展示）"
echo "=============================================="
echo ""

# 检查是否在 git 仓库中
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是 Git 仓库"
    echo "请先执行: git init"
    exit 1
fi

# 确保在 main 分支
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  当前分支是 $current_branch，切换到 main 分支..."
    git checkout main
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告：有未提交的更改"
    git status
    echo ""
    read -p "是否继续？(y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "已取消"
        exit 0
    fi
fi

echo "[1/5] 创建 demo 分支..."
git checkout -b demo 2>/dev/null || git checkout demo

echo "[2/5] 删除敏感配置文件..."
# 删除 Open Claw 配置（包含 API 详情）
rm -f admin/OPEN_CLAW_CONFIG.json
rm -f admin/OPEN_CLAW_GUIDE.md

# 删除部署脚本中的敏感信息
rm -f deploy-to-production.sh
rm -f package-for-deploy.sh

# 删除服务器相关文档
rm -f SSH_DEPLOYMENT_SOLUTION.md
rm -f DEPLOYMENT_SSH_KEY_GUIDE.md

echo "[3/5] 创建示例配置文件..."
# 创建空的示例配置文件
cat > admin/API_CONFIG_EXAMPLE.json << 'EOF'
{
  "name": "Indigenex API",
  "base_url": "https://your-domain.com/api",
  "authentication": {
    "type": "api_key",
    "header": "X-API-Key"
  }
}
EOF

cat > DEPLOYMENT_GUIDE.md << 'EOF'
# 部署指南

## 环境要求
- Node.js 20+
- Nginx
- PM2

## 安装步骤
1. 安装依赖
   ```bash
   cd backend && npm ci
   cd ../frontend && npm ci
   cd ../admin && npm ci
   ```

2. 配置环境变量
   - 复制 `backend/.env.example` 到 `backend/.env`
   - 填写数据库、JWT密钥等配置

3. 构建并启动
   ```bash
   # 后端
   cd backend && npm start

   # 前台
   cd frontend && npm run build && npm start

   # 后台
   cd admin && npm run build
   ```

详细文档请联系购买方获取。
EOF

echo "[4/5] 修改 README..."
cat > README.md << 'EOF'
# Indigenex Freight Management System

国际物流运价管理系统演示版

## 功能特点
- 🚢 海运运价查询与管理
- 📊 可视化数据展示
- 🔐 会员管理系统
- 📱 响应式设计

## 技术栈
- Frontend: Next.js + Tailwind CSS
- Admin: React + Vite
- Backend: Express + Prisma + SQLite

## 演示账号
- 用户名: admin
- 密码: admin123

## 购买完整版
如需购买完整源码，请联系：
- 邮箱: your-email@example.com

## 许可证
本演示版仅供展示，未经授权不得用于商业用途。
EOF

echo "[5/5] 提交更改..."
git add -A
git commit -m "chore: 准备演示版分支

- 移除敏感配置文件
- 删除部署脚本和服务器信息
- 简化文档为演示用途
- 添加示例配置文件"

echo ""
echo "=============================================="
echo "  ✅ 演示版分支创建完成！"
echo "=============================================="
echo ""
echo "当前分支: $(git branch --show-current)"
echo ""
echo "📦 交付步骤:"
echo "  1. 导出源码（不包含 .git）:"
echo "     cd .. && tar czvf indigenex-demo.tar.gz --exclude='.git' indigenex-website/"
echo ""
echo "  2. 返回 main 分支继续开发:"
echo "     git checkout main"
echo ""
echo "⚠️  注意: demo 分支不应推送至公开仓库"
echo "=============================================="
