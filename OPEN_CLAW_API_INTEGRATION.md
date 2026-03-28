# Indigenex 运价 API 对接文档

> 适用于 Open Claw 等第三方系统对接
> API 版本: v1.0
> 更新日期: 2026-03-27

---

## 目录

1. [API Key 管理](#api-key-管理)
2. [接口概览](#接口概览)
3. [运价字段说明](#运价字段说明)
4. [API 端点](#api-端点)
5. [完整测试用例](#完整测试用例)
6. [Open Claw 集成示例](#open-claw-集成示例)
7. [批量导入最佳实践](#批量导入最佳实践)

---

## API Key 管理

### 后台管理

API Key 的管理位于运价管理后台：**管理后台 → API Key管理**

访问地址：`http://47.236.193.197/admin/#/api-keys`

### 创建 API Key

1. 点击「新建API Key」按钮
2. 填写以下信息：
   - **名称**：API Key 的备注名称（如：Open Claw对接）
   - **会员ID**：绑定到哪个会员账号
3. 点击「创建」

### 复制 API Key

创建成功后，会弹出对话框显示完整的 API Key：

⚠️ **重要安全提示**：
- API Key **仅在创建时显示一次**
- 点击「复制密钥」按钮保存到剪贴板
- **关闭对话框后无法再次查看完整密钥**
- 如遗失，需要重新创建

```
┌─────────────────────────────────────────┐
│  ✅ 创建成功                             │
│                                         │
│  请立即复制并保存API Key                  │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ a61d61a138f97e926223...          │   │
│  │                                  │   │
│  │ [  复制密钥  ]                    │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ⚠️ API Key 仅在创建时显示一次           │
│     关闭后将无法再次查看，请妥善保管       │
│                                         │
└─────────────────────────────────────────┘
```

### 密钥显示规则

在 API Key 列表中，密钥会显示为部分隐藏格式：

```
原始密钥：a61d61a138f97e9262231d8b6bc9ead0dd71b8a885bdb280ed33e61a018c9000
显示形式：a61d****c9000
```

点击复制按钮可获取完整密钥。

---

## 接口概览

### 基础信息

| 项目 | 内容 |
|------|------|
| API 地址 | `http://47.236.193.197/api/v1` |
| 认证方式 | API Key (Header: X-API-Key) |
| 数据格式 | JSON |
| 编码格式 | UTF-8 |
| 时区 | Asia/Shanghai (UTC+8) |

### 认证方式

所有请求必须在 Header 中携带 `X-API-Key`：

```http
X-API-Key: your_api_key_here
Content-Type: application/json
```

---

## 二、运价字段说明

### 完整字段列表

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| **基础信息** |||||
| originPort | String | ✅ | 起运港中文名 | 上海 |
| originPortEn | String | ❌ | 起运港英文名 | Shanghai |
| destinationPort | String | ✅ | 目的港中文名 | 洛杉矶 |
| destinationPortEn | String | ❌ | 目的港英文名 | Los Angeles |
| viaPort | String | ❌ | 中转港 | 釜山 |
| viaPortEn | String | ❌ | 中转港英文名 | Busan |
| portArea | String | ❌ | 港区 | 洋山港区 |
| route | String | ❌ | 航线名称 | 中美航线 |
| **有效期** |||||
| validFrom | Date | ✅ | 有效期开始 | 2026-04-01 |
| validTo | Date | ✅ | 有效期结束 | 2026-04-30 |
| validityType | String | ❌ | 有效期类型 (LONG/SHORT) | LONG |
| isRecommended | Boolean | ❌ | 是否推荐 | false |
| **运价 - FCL整箱** |||||
| price20GP | Float | ❌ | 20尺柜运价 | 1200.00 |
| price40GP | Float | ❌ | 40尺柜运价 | 1800.00 |
| price40HQ | Float | ❌ | 40尺高柜运价 | 1900.00 |
| price45HQ | Float | ❌ | 45尺高柜运价 | 2200.00 |
| currency | String | ❌ | 币种 (默认 USD) | USD |
| **成本价** |||||
| cost20GP | Float | ❌ | 20尺柜成本价 | 1000.00 |
| cost40GP | Float | ❌ | 40尺柜成本价 | 1600.00 |
| cost40HQ | Float | ❌ | 40尺高柜成本价 | 1700.00 |
| cost45HQ | Float | ❌ | 45尺高柜成本价 | 2000.00 |
| isAllIn | Boolean | ❌ | 是否ALL IN价 | false |
| **船公司信息** |||||
| carrier | String | ❌ | 船公司名称 | COSCO |
| carrierLogo | String | ❌ | 船公司Logo URL | https://... |
| **航程信息** |||||
| transitTime | Int | ❌ | 航程天数 | 14 |
| schedule | String | ❌ | 船期 | 周一/三/五 |
| routeCode | String | ❌ | 航线代码 | CAX1 |
| **船期信息** |||||
| vesselName | String | ❌ | 船名 | COSCO SHANGHAI |
| voyage | String | ❌ | 航次 | V.001E |
| sailingDate | Date | ❌ | 开航日 | 2026-04-05 |
| estimatedDeparture | Date | ❌ | ETD | 2026-04-05T10:00:00Z |
| **订舱信息** |||||
| bookingAgent | String | ❌ | 订舱代理 | 上海代理 |
| bookingLink | String | ❌ | 订舱链接 | https://... |
| spaceStatus | String | ❌ | 舱位状态 | AVAILABLE |
| **文件截止** |||||
| docCutoffDay | String | ❌ | 截文件天 | 周三 |
| docCutoffTime | String | ❌ | 截文件时间 | 12:00 |
| **提单信息** |||||
| billOfLadingType | String | ❌ | 提单类型 | 电放 |
| shippingTerms | String | ❌ | 运输条款 | CY-CY |
| deliveryGuide | String | ❌ | 放货指引 | 凭正本提单 |
| **附加费和说明** |||||
| surcharges | Object | ❌ | 附加费 (JSON对象) | {"BAF": 100} |
| weightLimit | String | ❌ | 限重说明 | 21吨 |
| remarks | String | ❌ | 备注 | 含燃油附加费 |
| **其他信息** |||||
| priceTrend | String | ❌ | 运价趋势 (UP/DOWN/STABLE) | STABLE |
| contactInfo | String | ❌ | 联系方式 | 张经理 13800138000 |
| receiptGuide | String | ❌ | 收货指引 | 提前3天预约 |
| **系统字段** |||||
| importBatchId | String | ❌ | 导入批次ID | batch_001 |

### 枚举值说明

**spaceStatus (舱位状态)**
- `AVAILABLE` - 舱位充足
- `LIMITED` - 舱位紧张
- `FULL` - 爆舱
- `SUSPENDED` - 停航

**validityType (有效期类型)**
- `LONG` - 长期有效
- `SHORT` - 短期有效

---

## 三、API 端点

### 1. 查询运价列表

获取符合条件的运价列表。

```http
GET /api/v1/freight-rates
```

#### 请求参数 (Query)

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | Int | ❌ | 页码 | 1 |
| limit | Int | ❌ | 每页条数 (最大100) | 20 |
| originPort | String | ❌ | 起运港 (模糊匹配) | - |
| destinationPort | String | ❌ | 目的港 (模糊匹配) | - |
| carrier | String | ❌ | 船公司 (模糊匹配) | - |
| transportMode | String | ❌ | 运输方式 (SEA/AIR/RAIL/TRUCK) | - |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "id": "uuid-string",
        "route": "中美航线",
        "originPort": "上海",
        "originPortEn": "Shanghai",
        "destinationPort": "洛杉矶",
        "destinationPortEn": "Los Angeles",
        "viaPort": null,
        "transportMode": "SEA",
        "price20GP": 1200.00,
        "price40GP": 1800.00,
        "price40HQ": 1900.00,
        "price45HQ": null,
        "currency": "USD",
        "carrier": "COSCO",
        "transitTime": 14,
        "schedule": "周一/三/五",
        "validFrom": "2026-04-01T00:00:00.000Z",
        "validTo": "2026-04-30T23:59:59.000Z",
        "spaceStatus": "AVAILABLE",
        "remarks": "含燃油附加费",
        "createdAt": "2026-03-27T10:00:00.000Z",
        "updatedAt": "2026-03-27T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### 2. 获取运价详情

根据 ID 获取单条运价详情。

```http
GET /api/v1/freight-rates/{id}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "rate": {
      "id": "uuid-string",
      "originPort": "上海",
      "destinationPort": "洛杉矶",
      ...
    }
  }
}
```

---

### 3. 创建运价（单条/批量）

创建新的运价记录，支持单条或批量创建（最多10,000条）。

```http
POST /api/v1/freight-rates
```

#### 分批处理机制

API 采用服务器端分批处理机制，控制 CPU 和内存压力：
- **批次大小**: 每批 100 条
- **批次间隔**: 100ms
- **最大记录**: 单次请求最多 10,000 条
- **进度日志**: 每 10 批次输出一次处理进度

这种机制确保大批量导入时服务器资源不会被耗尽。

#### 请求体

**单条创建：**

```json
{
  "originPort": "上海",
  "destinationPort": "洛杉矶",
  "carrier": "COSCO",
  "price20GP": 1200.00,
  "price40GP": 1800.00,
  "price40HQ": 1900.00,
  "currency": "USD",
  "transitTime": 14,
  "schedule": "周一/三/五",
  "validFrom": "2026-04-01",
  "validTo": "2026-04-30",
  "spaceStatus": "AVAILABLE"
}
```

**批量创建：**

```json
[
  {
    "originPort": "上海",
    "destinationPort": "洛杉矶",
    "carrier": "COSCO",
    "price20GP": 1200.00,
    "price40HQ": 1900.00,
    "validFrom": "2026-04-01",
    "validTo": "2026-04-30"
  },
  {
    "originPort": "上海",
    "destinationPort": "长滩",
    "carrier": "MSC",
    "price20GP": 1150.00,
    "price40HQ": 1850.00,
    "validFrom": "2026-04-01",
    "validTo": "2026-04-30"
  }
]
```

#### 响应示例

```json
{
  "success": true,
  "message": "创建完成：成功 2 条，失败 0 条",
  "data": {
    "total": 2,
    "success": 2,
    "failed": 0,
    "rates": [
      { "id": "uuid-1", ... },
      { "id": "uuid-2", ... }
    ],
    "errors": []
  }
}
```

---

### 4. 更新运价

根据 ID 更新运价信息。

```http
PUT /api/v1/freight-rates/{id}
```

#### 请求体

```json
{
  "price20GP": 1300.00,
  "price40HQ": 2000.00,
  "spaceStatus": "LIMITED",
  "remarks": "运价上调"
}
```

#### 响应示例

```json
{
  "success": true,
  "message": "运价更新成功",
  "data": {
    "rate": {
      "id": "uuid-string",
      "price20GP": 1300.00,
      ...
    }
  }
}
```

---

### 5. 删除运价

根据 ID 删除运价记录。

```http
DELETE /api/v1/freight-rates/{id}
```

#### 响应示例

```json
{
  "success": true,
  "message": "运价删除成功"
}
```

---

## 四、错误处理

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 (API Key 无效) |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 错误响应格式

```json
{
  "success": false,
  "message": "错误描述信息"
}
```

### 常见错误

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| 未提供API Key | Header 中缺少 X-API-Key | 添加正确的 API Key |
| 无效的API Key | API Key 不存在 | 检查 API Key 是否正确 |
| API Key已被禁用 | 密钥被管理员禁用 | 联系管理员启用 |
| API Key已过期 | 密钥已过有效期 | 申请新的 API Key |
| 会员账户未激活 | 账户状态异常 | 完成会员认证流程 |
| 起运港和目的港为必填项 | 缺少必填字段 | 补充必填参数 |
| 单次最多支持100条运价批量创建 | 批量数据过多 | 分批发送请求 |

---

## 五、Open Claw 集成示例

### Python 示例代码

```python
import requests
import json
from datetime import datetime, timedelta

class IndigenexAPI:
    """Indigenex 运价 API 客户端"""

    def __init__(self, api_key, base_url="http://47.236.193.197/api/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }

    def get_rates(self, **params):
        """查询运价列表"""
        response = requests.get(
            f"{self.base_url}/freight-rates",
            headers=self.headers,
            params=params
        )
        return response.json()

    def create_rate(self, rate_data):
        """创建单条运价"""
        response = requests.post(
            f"{self.base_url}/freight-rates",
            headers=self.headers,
            json=rate_data
        )
        return response.json()

    def create_rates_batch(self, rates_list):
        """批量创建运价 (最多100条)"""
        if len(rates_list) > 100:
            raise ValueError("单次最多支持100条运价")

        response = requests.post(
            f"{self.base_url}/freight-rates",
            headers=self.headers,
            json=rates_list
        )
        return response.json()

    def update_rate(self, rate_id, update_data):
        """更新运价"""
        response = requests.put(
            f"{self.base_url}/freight-rates/{rate_id}",
            headers=self.headers,
            json=update_data
        )
        return response.json()

    def delete_rate(self, rate_id):
        """删除运价"""
        response = requests.delete(
            f"{self.base_url}/freight-rates/{rate_id}",
            headers=self.headers
        )
        return response.json()


# ============ 使用示例 ============

# 初始化客户端
api = IndigenexAPI(api_key="your_api_key_here")

# 1. 查询运价列表
result = api.get_rates(
    originPort="上海",
    destinationPort="洛杉矶",
    page=1,
    limit=10
)
print(f"查询到 {result['data']['pagination']['total']} 条运价")

# 2. 创建单条运价
new_rate = {
    "originPort": "上海",
    "destinationPort": "洛杉矶",
    "carrier": "COSCO",
    "price20GP": 1200.00,
    "price40HQ": 1900.00,
    "currency": "USD",
    "transitTime": 14,
    "validFrom": datetime.now().strftime("%Y-%m-%d"),
    "validTo": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
    "spaceStatus": "AVAILABLE"
}
result = api.create_rate(new_rate)
print(f"创建结果: {result['message']}")

# 3. 批量导入运价
rates_batch = [
    {
        "originPort": "上海",
        "destinationPort": "洛杉矶",
        "carrier": "COSCO",
        "price20GP": 1200.00,
        "price40HQ": 1900.00,
        "validFrom": "2026-04-01",
        "validTo": "2026-04-30"
    },
    {
        "originPort": "宁波",
        "destinationPort": "长滩",
        "carrier": "MSC",
        "price20GP": 1150.00,
        "price40HQ": 1850.00,
        "validFrom": "2026-04-01",
        "validTo": "2026-04-30"
    }
]
result = api.create_rates_batch(rates_batch)
print(f"批量导入: 成功 {result['data']['success']} 条, 失败 {result['data']['failed']} 条")
```

### JavaScript/Node.js 示例

```javascript
const axios = require('axios');

class IndigenexAPI {
  constructor(apiKey, baseUrl = 'http://47.236.193.197/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // 查询运价列表
  async getRates(params = {}) {
    const response = await this.client.get('/freight-rates', { params });
    return response.data;
  }

  // 创建运价（单条/批量）
  async createRate(rateData) {
    const response = await this.client.post('/freight-rates', rateData);
    return response.data;
  }

  // 更新运价
  async updateRate(rateId, updateData) {
    const response = await this.client.put(`/freight-rates/${rateId}`, updateData);
    return response.data;
  }

  // 删除运价
  async deleteRate(rateId) {
    const response = await this.client.delete(`/freight-rates/${rateId}`);
    return response.data;
  }
}

// 使用示例
async function main() {
  const api = new IndigenexAPI('your_api_key_here');

  try {
    // 查询运价
    const rates = await api.getRates({
      originPort: '上海',
      destinationPort: '洛杉矶',
      limit: 10
    });
    console.log(`查询到 ${rates.data.pagination.total} 条运价`);

    // 创建运价
    const newRate = await api.createRate({
      originPort: '上海',
      destinationPort: '洛杉矶',
      carrier: 'COSCO',
      price20GP: 1200,
      price40HQ: 1900,
      validFrom: '2026-04-01',
      validTo: '2026-04-30'
    });
    console.log('创建结果:', newRate.message);

  } catch (error) {
    console.error('API 错误:', error.response?.data || error.message);
  }
}

main();
```

---

## 五、完整测试用例（已验证）

以下测试用例已在实际环境中验证通过，可直接用于 Open Claw 集成测试。

### 测试环境信息

| 项目 | 值 |
|------|-----|
| 测试时间 | 2026-03-27 |
| 服务器地址 | http://47.236.193.197 |
| API 版本 | v1 |
| 测试状态 | ✅ 通过 |

### 完整请求示例

```http
POST /api/v1/freight-rates
Content-Type: application/json
X-API-Key: your_api_key_here

{
  "route": "中美测试航线",
  "originPort": "上海",
  "originPortEn": "Shanghai",
  "destinationPort": "洛杉矶",
  "destinationPortEn": "Los Angeles",
  "viaPort": "釜山",
  "viaPortEn": "Busan",
  "portArea": "洋山港区",
  "validFrom": "2026-04-01",
  "validTo": "2026-04-30",
  "validityType": "LONG",
  "isRecommended": true,
  "price20GP": 1200.00,
  "price40GP": 1800.00,
  "price40HQ": 1900.00,
  "price45HQ": 2200.00,
  "currency": "USD",
  "cost20GP": 1000.00,
  "cost40GP": 1600.00,
  "cost40HQ": 1700.00,
  "cost45HQ": 2000.00,
  "isAllIn": false,
  "carrier": "COSCO",
  "carrierLogo": "https://example.com/cosco-logo.png",
  "transitTime": 14,
  "schedule": "周一/三/五",
  "routeCode": "TEST001",
  "vesselName": "COSCO SHANGHAI",
  "voyage": "V.001E",
  "sailingDate": "2026-04-05",
  "estimatedDeparture": "2026-04-05T10:00:00Z",
  "bookingAgent": "上海测试代理",
  "bookingLink": "https://booking.example.com/test",
  "spaceStatus": "AVAILABLE",
  "docCutoffDay": "周三",
  "docCutoffTime": "12:00",
  "billOfLadingType": "电放",
  "shippingTerms": "CY-CY",
  "deliveryGuide": "凭正本提单放货",
  "surcharges": {
    "BAF": 100,
    "CAF": 50,
    "THC": 200
  },
  "weightLimit": "21吨",
  "remarks": "接口测试",
  "priceTrend": "STABLE",
  "contactInfo": "张经理 13800138000",
  "receiptGuide": "提前3天预约",
  "importBatchId": "test_batch_001"
}
```

### 成功响应示例

```json
{
  "success": true,
  "message": "创建完成：成功 1 条，失败 0 条",
  "data": {
    "total": 1,
    "success": 1,
    "failed": 0,
    "rates": [
      {
        "id": "d757d710-5a2b-48ba-a8ca-d211fc1c9105",
        "route": "中美测试航线",
        "originPort": "上海",
        "originPortEn": "Shanghai",
        "destinationPort": "洛杉矶",
        "destinationPortEn": "Los Angeles",
        "carrier": "COSCO",
        "price20GP": 1200,
        "price40GP": 1800,
        "price40HQ": 1900,
        "currency": "USD",
        "transitTime": 14,
        "spaceStatus": "AVAILABLE",
        "remarks": "接口测试",
        "status": "ACTIVE",
        "importBatchId": "test_batch_001",
        "createdBy": "api:43d1b793-0a1c-462a-8fbe-214fb6c509a8",
        "createdAt": "2026-03-27T00:16:49.213Z",
        "updatedAt": "2026-03-27T00:16:49.213Z"
      }
    ],
    "errors": []
  }
}
```

### 验证记录

```sql
-- 数据库验证查询
SELECT id, originPort, destinationPort, carrier, remarks, status
FROM FreightRate
WHERE remarks = '接口测试';

-- 返回结果:
-- d757d710-5a2b-48ba-a8ca-d211fc1c9105 | 上海 | 洛杉矶 | COSCO | 接口测试 | ACTIVE
```

### 最小可运行示例

仅需以下必填字段即可创建运价：

```json
{
  "originPort": "上海",
  "destinationPort": "洛杉矶",
  "validFrom": "2026-04-01",
  "validTo": "2026-04-30",
  "remarks": "接口测试"
}
```

**说明：**
- `originPort` 和 `destinationPort` 为必填项
- `validFrom` 和 `validTo` 如不填将使用默认值（当前日期起30天）
- 其他所有字段均为可选
- 返回的 `id` 可用于后续的更新或删除操作

---

### PHP 示例

```php
<?php

class IndigenexAPI {
    private $apiKey;
    private $baseUrl;

    public function __construct($apiKey, $baseUrl = 'http://47.236.193.197/api/v1') {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }

    private function request($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        $ch = curl_init($url);

        $headers = [
            'X-API-Key: ' . $this->apiKey,
            'Content-Type: application/json'
        ];

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return json_decode($response, true);
    }

    public function getRates($params = []) {
        $query = http_build_query($params);
        return $this->request('GET', '/freight-rates?' . $query);
    }

    public function createRate($rateData) {
        return $this->request('POST', '/freight-rates', $rateData);
    }

    public function updateRate($rateId, $updateData) {
        return $this->request('PUT', '/freight-rates/' . $rateId, $updateData);
    }

    public function deleteRate($rateId) {
        return $this->request('DELETE', '/freight-rates/' . $rateId);
    }
}

// 使用示例
$api = new IndigenexAPI('your_api_key_here');

// 查询运价
$rates = $api->getRates([
    'originPort' => '上海',
    'destinationPort' => '洛杉矶'
]);
echo "查询到 {$rates['data']['pagination']['total']} 条运价\n";

// 创建运价
$newRate = $api->createRate([
    'originPort' => '上海',
    'destinationPort' => '洛杉矶',
    'carrier' => 'COSCO',
    'price20GP' => 1200,
    'price40HQ' => 1900,
    'validFrom' => '2026-04-01',
    'validTo' => '2026-04-30'
]);
echo "创建结果: {$newRate['message']}\n";
?>
```

---

## 六、批量导入最佳实践

### 分批导入策略

由于单次请求最多支持 100 条运价，大批量导入时需要分批处理：

```python
def import_large_batch(api, rates_list, batch_size=100):
    """大批量运价导入（自动分批）"""
    total = len(rates_list)
    success_count = 0
    failed_count = 0
    errors = []

    for i in range(0, total, batch_size):
        batch = rates_list[i:i + batch_size]
        print(f"正在导入第 {i+1}-{min(i+batch_size, total)} 条...")

        result = api.create_rates_batch(batch)
        success_count += result['data']['success']
        failed_count += result['data']['failed']

        if result['data']['errors']:
            errors.extend(result['data']['errors'])

        # 添加延迟避免触发限流
        if i + batch_size < total:
            time.sleep(1)

    print(f"导入完成: 成功 {success_count} 条, 失败 {failed_count} 条")
    return {
        'total': total,
        'success': success_count,
        'failed': failed_count,
        'errors': errors
    }
```

### 数据清洗建议

导入前进行数据验证：

```python
def validate_rate_data(rate):
    """验证运价数据完整性"""
    errors = []

    # 必填字段检查
    if not rate.get('originPort'):
        errors.append('缺少起运港')
    if not rate.get('destinationPort'):
        errors.append('缺少目的港')

    # 日期格式检查
    try:
        if 'validFrom' in rate:
            datetime.strptime(rate['validFrom'], '%Y-%m-%d')
        if 'validTo' in rate:
            datetime.strptime(rate['validTo'], '%Y-%m-%d')
    except ValueError:
        errors.append('日期格式错误，应为 YYYY-MM-DD')

    # 价格检查
    price_fields = ['price20GP', 'price40GP', 'price40HQ', 'price45HQ']
    for field in price_fields:
        if field in rate and rate[field] is not None:
            if not isinstance(rate[field], (int, float)) or rate[field] < 0:
                errors.append(f'{field} 必须是正数')

    return errors
```

---

## 七、联系支持

如有技术问题，请联系：

- 技术支持邮箱: [待填写]
- API 文档更新: [待填写]

---

**文档版本**: v1.0
**最后更新**: 2026-03-27
**API 服务地址**: http://47.236.193.197
