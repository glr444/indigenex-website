#!/bin/bash
# Git 仓库初始化脚本
# 一步完成仓库初始化和分支设置

set -e

echo "=============================================="
echo "  Indigenex Git 仓库初始化"
echo "=============================================="
echo ""

# 检查是否已初始化
if [ -d ".git" ]; then
    echo "⚠️  Git 仓库已存在"
    read -p "是否重新初始化？(y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "已取消"
        exit 0
    fi
    rm -rf .git
fi

echo "[1/4] 初始化 Git 仓库..."
git init

echo "[2/4] 添加文件到暂存区..."
git add .

echo "[3/4] 创建初始提交..."
git commit -m "init: 初始提交

- 前台: Next.js + Tailwind CSS
- 后台: React + Vite
- 后端: Express + Prisma + SQLite
- 完整运价管理系统"

echo "[4/4] 创建分支结构..."
# 创建并切换到 main 分支（确保存在）
git checkout -b main 2>/dev/null || git checkout main

# 标记初始版本
git tag -a v0.1.0 -m "初始版本 v0.1.0"

echo ""
echo "=============================================="
echo "  ✅ Git 仓库初始化完成！"
echo "=============================================="
echo ""
echo "📋 当前状态:"
git log --oneline -1
echo ""
echo "📁 分支列表:"
git branch -a
echo ""
echo "🏷️  标签列表:"
git tag
echo ""
echo "📖 下一步:"
echo "  1. 开发新功能: 直接在 main 分支工作"
echo "  2. 创建演示版: ./scripts/prepare-demo.sh"
echo "  3. 查看文档: cat GIT_WORKFLOW.md"
echo ""
echo "💾 备份提醒:"
echo "  - 定期将整个目录备份到其他位置"
echo "  - 不要将 .git 目录暴露给客户"
echo "=============================================="
