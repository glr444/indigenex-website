# 运价数据导入说明

## 数据清理完成
所有测试数据已删除，现有运价数据：0 条

## Excel 导入格式要求

### 必须字段
| 字段名 | 说明 | 示例 |
|--------|------|------|
| 起运港 | **必须使用英文港口名** | SHANGHAI, QINGDAO, NINGBO |
| 目的港 | **必须使用英文港口名** | HAMBURG, LOS ANGELES, TOKYO |
| 生效日期 | 格式：YYYY-MM-DD | 2026-03-25 |
| 到期日期 | 格式：YYYY-MM-DD | 2026-04-25 |

### 可选字段
| 字段名 | 说明 | 示例 |
|--------|------|------|
| 航线 | 航线代码 | ME3, AEX2 |
| 船公司 | 承运人名称 | MAERSK, COSCO, MSC |
| 中转港 | 如有中转，填写英文港口名 | SINGAPORE |
| 20GP | 20尺柜价格 | 1350 |
| 40GP | 40尺柜价格 | 2400 |
| 40HQ | 40尺高柜价格 | 2650 |
| 币种 | USD 或 CNY | USD |
| 运输时间 | 航程天数 | 32 |
| 船期 | 开船日期/周期 | 周一/weekly |
| 备注 | 其他说明 | 舱位紧张 |

## 系统支持的港口列表（英文）

### 中国港口
- SHANGHAI (上海)
- QINGDAO (青岛)
- TIANJIN (天津)
- DALIAN (大连)
- NINGBO (宁波)
- SHENZHEN (深圳)
- XIAMEN (厦门)
- FOSHAN (佛山)
- HONG KONG (香港)
- HUIZHOU (惠州)

### 日本港口
- TOKYO (东京)
- YOKOHAMA (横滨)
- NAGOYA (名古屋)
- OSAKA (大阪)
- KOBE (神户)
- MOJI (门司)

### 韩国港口
- INCHEON (仁川)
- GYEONGIN (京仁)
- BUSAN (釜山)

### 东南亚港口
- SINGAPORE (新加坡)
- PORT KLANG (巴生港)
- JAKARTA (雅加达)
- BANGKOK (曼谷)
- HO CHI MINH (胡志明)
- HAIPHONG (海防)
- MANILA (马尼拉)

### 欧洲港口
- HAMBURG (汉堡)
- ROTTERDAM (鹿特丹)
- ANTWERP (安特卫普)
- FELIXSTOWE (费利克斯托)
- LE HAVRE (勒阿弗尔)
- BARCELONA (巴塞罗那)
- GENOA (热那亚)

### 北美港口
- LOS ANGELES (洛杉矶)
- LONG BEACH (长滩)
- OAKLAND (奥克兰)
- SEATTLE (西雅图)
- NEW YORK (纽约)
- SAVANNAH (萨凡纳)
- VANCOUVER (温哥华)

### 中东港口
- DUBAI (迪拜)
- JEDDAH (吉达)

### 澳洲港口
- MELBOURNE (墨尔本)
- SYDNEY (悉尼)

## Excel 模板示例

```
航线    | 起运港   | 目的港    | 船公司 | 20GP | 40GP | 40HQ | 币种 | 生效日期   | 到期日期   | 运输时间 | 船期 | 备注
ME3     | SHENZHEN | HAMBURG   | MAERSK | 1350 | 2400 | 2650 | USD  | 2026-03-25 | 2026-04-25 | 32       | 周一 | 舱位紧张
AEX2    | SHANGHAI | LOS ANGELES | COSCO | 1800 | 2800 | 3100 | USD  | 2026-03-25 | 2026-04-25 | 14       | 周三 | 直航
```

## 导入步骤

1. 在后台管理系统进入【运价管理】
2. 点击【导入】按钮
3. 选择符合格式的 Excel 文件
4. 系统自动解析并导入数据

## 注意事项

1. **起运港和目的港必须使用英文名称**，否则无法匹配系统港口数据
2. 日期格式建议统一使用 YYYY-MM-DD（如：2026-03-25）
3. 价格字段只需填写数字，不需要货币符号
4. 币种默认为 USD，如需人民币请填写 CNY
