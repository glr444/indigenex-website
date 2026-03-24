# Indigenex Website - Git 版本管理指南

> 单仓库多分支管理策略

---

## 分支结构说明

```
main                → 完整源码（核心资产，私有）
  │
  ├── demo          → 删减演示版（可公开，用于销售展示）
  │
  ├── client-a      → 客户A定制版（如有）
  ├── client-b      → 客户B定制版（如有）
  │
  └── v1.0, v1.1    → 版本标签
```

---

## 各分支用途

| 分支 | 类型 | 用途 | 访问权限 |
|------|------|------|----------|
| `main` | 主分支 | 完整源码，所有功能 | 仅你个人 |
| `demo` | 展示分支 | 删减版，用于销售展示 | 可公开 |
| `client-*` | 客户分支 | 特定客户定制版本 | 仅该客户 |

---

## demo 分支删减内容（销售展示版）

demo 分支用于向潜在客户展示，需要移除以下内容：

### 删除的文件/功能
- [ ] Open Claw AI 配置文件（`admin/OPEN_CLAW_CONFIG.json`）
- [ ] API 详细文档中的敏感信息
- [ ] 部署脚本中的服务器 IP/密钥
- [ ] 后端 .env 文件中的真实密钥
- [ ] 会员系统（可保留基础框架，移除完整逻辑）
- [ ] 大掌柜 API 对接配置

### 保留的内容
- [x] 前台网站完整功能
- [x] 管理后台基础框架
- [x] 运价管理模块
- [x] 询盘管理模块
- [x] 新闻管理模块

---

## 常用操作命令

### 1. 日常开发（main 分支）
```bash
# 在 main 分支开发
git checkout main
# 编辑代码...
git add .
git commit -m "feat: 添加新功能"
```

### 2. 更新演示版（demo 分支）
```bash
# 从 main 同步到 demo
git checkout demo
git merge main
# 删除敏感文件后提交
git add .
git commit -m "chore: 更新演示版"
```

### 3. 创建客户定制版
```bash
# 从 main 创建客户分支
git checkout -b client-xxx main
# 进行客户定制开发...
git add .
git commit -m "feat: 客户xxx定制功能"
```

### 4. 打版本标签
```bash
# 发布 v1.0 版本
git checkout main
git tag -a v1.0 -m "版本 1.0 发布"
git push origin v1.0
```

---

## 销售流程

### 向客户展示
1. 提供 `demo` 分支的代码或演示链接
2. 客户下单后，从 `main` 分支创建 `client-xxx` 分支
3. 根据客户需求定制开发
4. 交付 `client-xxx` 分支代码

### 版本定价策略（建议）

| 版本 | 价格区间 | 包含内容 |
|------|----------|----------|
| **基础版** | ¥3,000-5,000 | demo 分支 + 基础部署文档 |
| **标准版** | ¥8,000-15,000 | main 分支 + 完整文档 |
| **企业版** | ¥20,000+ | main 分支 + 定制开发 + 技术支持 |

---

## 首次设置步骤

### Step 1: 初始化仓库（已执行）
```bash
git init
git add .
git commit -m "init: 初始提交"
```

### Step 2: 创建 demo 分支
```bash
git checkout -b demo
# 删除敏感文件...
git add .
git commit -m "chore: 创建演示版分支"
```

### Step 3: 返回 main 分支继续开发
```bash
git checkout main
```

---

## 注意事项

1. **永远不要**将 `main` 分支推送到公开仓库
2. **永远不要**在代码中提交真实的服务器密钥、密码
3. 定期备份 `.git` 目录到其他安全位置
4. 给客户交付源码前，删除 `.git` 目录（避免暴露历史）

---

**文档版本**: v1.0
**创建日期**: 2026-03-24
