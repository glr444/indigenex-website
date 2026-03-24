# Indigenex 服务器部署清单

## 已生成的文件

### 1. 部署文档
| 文件 | 说明 |
|------|------|
| `PRODUCTION_DEPLOYMENT.md` | 完整的生产部署指南 |
| `DEPLOY_CHECKLIST.md` | 本文件，部署核对清单 |

### 2. 部署脚本
| 文件 | 说明 |
|------|------|
| `deploy-to-production.sh` | 服务器一键部署脚本 |
| `package-for-deploy.sh` | 本地打包脚本 |

### 3. Open Claw AI 对接文件
| 文件 | 说明 |
|------|------|
| `admin/API_DOCUMENTATION.md` | 完整 API 接口文档 |
| `admin/OPEN_CLAW_CONFIG.json` | Open Claw AI 配置文件 |
| `admin/OPEN_CLAW_GUIDE.md` | 快速对接指南 |

---

## 部署步骤

### 第一步：本地打包（在 Mac 上执行）

```bash
cd /Users/ligang/New/indigenex-website

# 执行打包脚本
./package-for-deploy.sh
```

输出示例：
```
部署包: deploy/indigenex-deploy-20260324_143000.tar.gz
部署脚本: deploy/deploy-to-production.sh
```

### 第二步：上传到服务器

```bash
# 替换为你的服务器 IP
SERVER_IP="your-server-ip"

# 上传部署包
scp deploy/indigenex-deploy-*.tar.gz root@$SERVER_IP:/var/www/

# 上传部署脚本
scp deploy/deploy-to-production.sh root@$SERVER_IP:/var/www/
```

### 第三步：在服务器上执行部署

```bash
# SSH 登录服务器
ssh root@your-server-ip

# 解压部署包
cd /var/www
tar xzvf indigenex-deploy-*.tar.gz
mv indigenex-deploy-* indigenex

# 执行部署脚本
cd indigenex
chmod +x deploy-to-production.sh
./deploy-to-production.sh
```

### 第四步：配置域名和 SSL

脚本会提示输入：
- 域名（如：cargogm.com）
- 邮箱（用于 SSL 证书）

### 第五步：获取 API Key

部署完成后，在服务器上查看：

```bash
ssh root@your-server-ip
cat /var/www/indigenex/.api_key
```

---

## Open Claw AI 配置

### 1. 基础配置

```yaml
Base URL: https://your-domain.com/api
Authentication: API Key
Header: X-API-Key
Key: (从服务器获取)
```

### 2. 导入配置文件

将 `admin/OPEN_CLAW_CONFIG.json` 导入到 Open Claw AI 平台。

---

## 部署后验证

### 验证网站访问
- [ ] https://your-domain.com （前台）
- [ ] https://your-domain.com/admin （后台）
- [ ] https://your-domain.com/api （API）

### 验证管理员登录
- [ ] 用户名：admin
- [ ] 密码：（查看服务器 `/var/www/indigenex/backend/.env`）

### 验证 API 接口
```bash
# 测试查询接口
curl -H "X-API-Key: your-api-key" \
  https://your-domain.com/api/v1/freight-rates

# 测试创建接口
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"originPort":"青岛","destinationPort":"墨尔本","validFrom":"2026-03-01","validTo":"2026-03-31"}' \
  https://your-domain.com/api/v1/freight-rates
```

---

## 服务器信息记录

| 项目 | 值 |
|------|-----|
| 服务器 IP | |
| 域名 | |
| 管理员密码 | |
| API Key | |
| 部署日期 | |

---

## 后续维护

### 查看服务状态
```bash
ssh root@your-server-ip
pm2 status
pm2 logs
```

### 更新部署
```bash
ssh root@your-server-ip
cd /var/www/indigenex
git pull origin main
./deploy-to-production.sh
```

### 备份数据
```bash
ssh root@your-server-ip
/usr/local/bin/backup-indigenex.sh
ls /var/backups/indigenex/
```

---

**部署准备完成！按上述步骤执行即可。**
