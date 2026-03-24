# Open Claw AI 快速对接指南

> Indigenex 运价管理系统 API 对接配置

---

## 一、API 接入信息

部署完成后，将以下信息填入 Open Claw AI：

| 配置项 | 值 |
|--------|-----|
| Base URL | `https://your-domain.com/api` |
| 认证方式 | API Key |
| Header 名称 | `X-API-Key` |
| API Key | （从服务器 `/var/www/indigenex/.api_key` 获取） |

---

## 二、Open Claw AI 配置步骤

### 步骤 1：获取 API Key

SSH 登录服务器，查看 API Key：

```bash
ssh root@your-server-ip
cat /var/www/indigenex/.api_key
```

输出示例：
```
API_KEY=a1b2c3d4e5f6...
```

### 步骤 2：配置 Open Claw AI

在 Open Claw AI 平台创建新的 API 集成：

```yaml
name: Indigenex Freight Rate Manager
api:
  base_url: https://your-domain.com/api
  authentication:
    type: api_key
    header: X-API-Key
    key: ${INDIGENEX_API_KEY}  # 从环境变量或配置中读取

endpoints:
  - name: list_freight_rates
    method: GET
    path: /v1/freight-rates
    description: 查询运价列表

  - name: create_freight_rate
    method: POST
    path: /v1/freight-rates
    description: 创建运价

  - name: update_freight_rate
    method: PUT
    path: /v1/freight-rates/{id}
    description: 更新运价

  - name: delete_freight_rate
    method: DELETE
    path: /v1/freight-rates/{id}
    description: 删除运价
```

### 步骤 3：导入配置文件

也可以直接导入 JSON 配置文件：

1. 下载 [OPEN_CLAW_CONFIG.json](./OPEN_CLAW_CONFIG.json)
2. 修改其中的 `base_url` 为你的实际域名
3. 在 Open Claw AI 平台导入此配置

---

## 三、智能体功能示例

### 功能 1：查询运价

**用户提问**：
```
查询青岛到墨尔本的COSCO运价
```

**Open Claw AI 调用**：
```
GET /api/v1/freight-rates?originPort=青岛&destinationPort=墨尔本&carrier=COSCO
```

### 功能 2：导入 Excel 运价

**用户提问**：
```
帮我导入这个Excel文件的运价数据
```

**Open Claw AI 处理流程**：
1. 解析用户上传的 Excel 文件
2. 提取每条运价记录
3. 循环调用 `POST /api/v1/freight-rates` 创建记录
4. 返回导入统计结果

### 功能 3：批量更新价格

**用户提问**：
```
将青岛到墨尔本航线所有COSCO的40HQ价格上调100美元
```

**Open Claw AI 处理流程**：
1. 查询符合条件的运价：`GET /api/v1/freight-rates?originPort=青岛&destinationPort=墨尔本&carrier=COSCO`
2. 对每条记录计算新价格
3. 调用 `PUT /api/v1/freight-rates/{id}` 更新价格
4. 返回更新统计

---

## 四、Excel 导入模板

用于 Open Claw AI 智能体解析和导入：

| 字段 | 说明 | 示例 |
|------|------|------|
| 航线 | 可选 | 澳新线 |
| 起运港 | 必填 | 青岛、上海、深圳 |
| 目的港 | 必填 | 墨尔本、洛杉矶、汉堡 |
| 中转港 | 可选 | 釜山、新加坡 |
| 运输方式 | 可选，默认SEA | SEA/AIR/LAND/RAIL |
| 船公司 | 可选 | COSCO、MSC、MAERSK |
| 20GP | 可选 | 1200 |
| 40GP | 可选 | 2000 |
| 40HQ | 可选 | 2100 |
| 币种 | 可选，默认USD | USD/CNY/EUR |
| 航程 | 可选（天） | 25 |
| 生效日期 | 必填 | 2026-03-01 |
| 到期日期 | 必填 | 2026-03-31 |
| 备注 | 可选 | 备注信息 |

---

## 五、常见问题

### Q1: API 返回 401 未授权？

**原因**：API Key 错误或过期
**解决**：
```bash
# 服务器上生成新的 API Key
openssl rand -hex 32 > /var/www/indigenex/.api_key
```

### Q2: 如何限制 API 访问频率？

在服务器上配置 Nginx 限流：

```nginx
# /etc/nginx/conf.d/rate-limit.conf
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    location /api {
        limit_req zone=api burst=20 nodelay;
        # ...
    }
}
```

### Q3: 如何查看 API 调用日志？

```bash
# 查看后端日志
pm2 logs indigenex-backend

# 查看 Nginx 访问日志
tail -f /var/log/nginx/access.log | grep /api
```

---

## 六、对接检查清单

- [ ] 服务器部署完成
- [ ] 域名可正常访问
- [ ] HTTPS 证书已配置
- [ ] API Key 已获取
- [ ] Open Claw AI 配置已导入
- [ ] 测试查询接口正常
- [ ] 测试创建接口正常
- [ ] 测试更新接口正常
- [ ] Excel 导入功能测试

---

## 七、联系方式

对接过程中如有问题：

- 技术文档：[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- 部署文档：[PRODUCTION_DEPLOYMENT.md](../PRODUCTION_DEPLOYMENT.md)
- 配置文件：[OPEN_CLAW_CONFIG.json](./OPEN_CLAW_CONFIG.json)

---

**文档版本**: v1.0
**更新日期**: 2026-03-24
