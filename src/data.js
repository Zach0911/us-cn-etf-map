export const marketData = {
  "date": "2026-06-09",
  "updatedAt": "2026-06-09T11:14:32+08:00",
  "sourceNote": "生产校验版：A股ETF代码、名称、成交额和涨跌幅来自东方财富公开行情；美股主ETF涨跌幅仅使用Nasdaq常规交易时段日线收盘价，不使用盘后、夜盘或实时价。美股主题强弱分数使用最新收盘价相对EMA5/EMA20/EMA60/EMA120/年内EMA的偏离计算。历史不足的标的使用可得日线初始化EMA，并仅展示可计算涨跌幅周期。",
  "periods": [
    "1d",
    "5d",
    "20d",
    "60d",
    "120d",
    "ytd"
  ],
  "themes": [
    {
      "id": "memory_chips",
      "name": "存储芯片",
      "signal": "共振",
      "confidence": 88,
      "lead": "美股领先，A股尚未完全跟随",
      "tags": [
        "DRAM",
        "NAND",
        "存储",
        "半导体",
        "芯片"
      ],
      "us": {
        "primary": "DRAM",
        "etfs": [
          "DRAM",
          "SOXX",
          "SMH"
        ],
        "returns": {
          "1d": 8.5,
          "5d": -11.0,
          "20d": 14.6,
          "ytd": 118.0
        },
        "rel": {
          "5d": -8.5,
          "20d": 14.4
        },
        "strength": {
          "short": 56,
          "mid": 99,
          "long": 99,
          "all": 88
        },
        "ema": {
          "ema5": -2.5,
          "ema20": 4.8,
          "ema60": 31.1,
          "ema120": 55.0,
          "emaYtd": 22.9
        }
      },
      "cn": [
        {
          "code": "512480",
          "name": "半导体ETF国联安",
          "index": "中证全指半导体指数",
          "returns": {
            "1d": 3.4,
            "5d": -5.1,
            "20d": 12.4,
            "60d": 35.6,
            "120d": 51.8
          },
          "rel": {
            "5d": 2,
            "20d": 4.4,
            "60d": 6.9,
            "120d": 9.3
          },
          "amount": 20.8,
          "mappingScore": 88,
          "status": "共振",
          "reasons": [
            "A股暂无纯存储主题场内基金",
            "用半导体宽主题作为替代映射",
            "流动性较好，适合观察资金扩散"
          ],
          "matchedTags": [
            "半导体",
            "存储"
          ]
        },
        {
          "code": "159995",
          "name": "芯片ETF华夏",
          "index": "国证芯片指数",
          "returns": {
            "1d": 3.6,
            "5d": -5.6,
            "20d": 12.7,
            "60d": 33.9,
            "120d": 47.2
          },
          "rel": {
            "5d": 1.8,
            "20d": 3.6,
            "60d": 5.8,
            "120d": 8.6
          },
          "amount": 17.5,
          "mappingScore": 88,
          "status": "共振",
          "reasons": [
            "A股暂无纯存储主题场内基金",
            "芯片主题覆盖部分存储产业链",
            "适合作为泛半导体替代映射"
          ],
          "matchedTags": [
            "半导体",
            "存储",
            "芯片"
          ]
        }
      ]
    },
    {
      "id": "semiconductor",
      "name": "半导体",
      "signal": "共振",
      "confidence": 92,
      "lead": "美股与A股同步走强",
      "tags": [
        "SOXX",
        "SMH",
        "芯片",
        "设备",
        "材料"
      ],
      "us": {
        "primary": "SOXX",
        "etfs": [
          "SOXX",
          "SMH",
          "XSD"
        ],
        "returns": {
          "1d": 5.9,
          "5d": -0.1,
          "20d": 9.8,
          "60d": 73.1,
          "120d": 90.8,
          "ytd": 82.2
        },
        "rel": {
          "5d": 2.4,
          "20d": 9.6,
          "60d": 62.1,
          "120d": 82.4
        },
        "strength": {
          "short": 57,
          "mid": 86,
          "long": 99,
          "all": 84
        },
        "ema": {
          "ema5": -0.5,
          "ema20": 4.4,
          "ema60": 21.1,
          "ema120": 38.4,
          "emaYtd": 33.9
        }
      },
      "cn": [
        {
          "code": "512480",
          "name": "半导体ETF国联安",
          "index": "中证全指半导体指数",
          "returns": {
            "1d": 3.4,
            "5d": -5.1,
            "20d": 12.4,
            "60d": 35.6,
            "120d": 51.8
          },
          "rel": {
            "5d": 2,
            "20d": 4.4,
            "60d": 6.9,
            "120d": 9.3
          },
          "amount": 20.8,
          "mappingScore": 99,
          "status": "共振",
          "reasons": [
            "ETF名称与半导体行业直接匹配",
            "A股半导体流动性代表品种",
            "适合作为SOXX/SMH的核心映射"
          ],
          "matchedTags": [
            "smh",
            "soxx",
            "半导体"
          ]
        }
      ]
    },
    {
      "id": "ai_compute",
      "name": "AI算力",
      "signal": "共振",
      "confidence": 86,
      "lead": "算力链条中美同步活跃",
      "tags": [
        "AI",
        "GPU",
        "算力",
        "服务器",
        "光模块"
      ],
      "us": {
        "primary": "THNQ",
        "etfs": [
          "THNQ",
          "AIQ",
          "QQQ"
        ],
        "returns": {
          "1d": 2.1,
          "5d": -7.2,
          "20d": 8.8,
          "60d": 42.9,
          "120d": 33.5,
          "ytd": 33.6
        },
        "rel": {
          "5d": -4.7,
          "20d": 8.6,
          "60d": 31.9,
          "120d": 25.1
        },
        "strength": {
          "short": 51,
          "mid": 71,
          "long": 99,
          "all": 77
        },
        "ema": {
          "ema5": -1.9,
          "ema20": 1.7,
          "ema60": 13.5,
          "ema120": 22.0,
          "emaYtd": 20.3
        }
      },
      "cn": [
        {
          "code": "515070",
          "name": "人工智能ETF华夏",
          "index": "中证人工智能主题指数",
          "returns": {
            "1d": 3.5,
            "5d": 1.7,
            "20d": 10.1,
            "60d": 31.3,
            "120d": 38.1
          },
          "rel": {
            "5d": 2.9,
            "20d": 6.2,
            "60d": 9.5,
            "120d": 13
          },
          "amount": 4,
          "mappingScore": 96,
          "status": "共振",
          "reasons": [
            "主题名称直接命中AI",
            "成份股覆盖算法、算力、应用",
            "中期趋势强"
          ],
          "matchedTags": [
            "ai",
            "人工智能",
            "算力"
          ]
        },
        {
          "code": "512720",
          "name": "计算机ETF国泰",
          "index": "中证计算机主题指数",
          "returns": {
            "1d": -0.7,
            "5d": -2.9,
            "20d": -9.3,
            "60d": -1.6,
            "120d": 1.5
          },
          "rel": {
            "5d": 1.2,
            "20d": 3.4,
            "60d": 5.1,
            "120d": 8.8
          },
          "amount": 0.6,
          "mappingScore": 68,
          "status": "传导",
          "reasons": [
            "计算机ETF覆盖部分算力和软件链条",
            "主题更宽，AI纯度低于人工智能ETF",
            "适合作为扩散行情补充观察"
          ],
          "matchedTags": [
            "ai",
            "人工智能",
            "算力",
            "计算机"
          ]
        }
      ]
    },
    {
      "id": "robotics",
      "name": "机器人",
      "signal": "共振",
      "confidence": 69,
      "lead": "美股机器人短期转强",
      "tags": [
        "BOTZ",
        "机器人",
        "自动化",
        "工业母机"
      ],
      "us": {
        "primary": "BOTZ",
        "etfs": [
          "BOTZ",
          "ROBO",
          "ARKQ"
        ],
        "returns": {
          "1d": 0.9,
          "5d": -5.6,
          "20d": -7.6,
          "60d": 7.7,
          "120d": 5.3,
          "ytd": 4.4
        },
        "rel": {
          "5d": -3.1,
          "20d": -7.8,
          "60d": -3.3,
          "120d": -3.1
        },
        "strength": {
          "short": 42,
          "mid": 44,
          "long": 56,
          "all": 48
        },
        "ema": {
          "ema5": -2.0,
          "ema20": -3.2,
          "ema60": -0.2,
          "ema120": 2.3,
          "emaYtd": 1.3
        }
      },
      "cn": [
        {
          "code": "159770",
          "name": "机器人ETF天弘",
          "index": "中证机器人指数",
          "returns": {
            "1d": 0.6,
            "5d": -2.9,
            "20d": 7,
            "60d": 10.7,
            "120d": 17.3
          },
          "rel": {
            "5d": 0.2,
            "20d": 1.1,
            "60d": 2.7,
            "120d": 5.4
          },
          "amount": 2.8,
          "mappingScore": 90,
          "status": "传导",
          "reasons": [
            "名称和主题完全匹配",
            "A股机器人核心场内品种",
            "短期尚未完全跟随"
          ],
          "matchedTags": [
            "机器人"
          ]
        }
      ]
    },
    {
      "id": "ev_battery",
      "name": "新能源车/锂电",
      "signal": "背离",
      "confidence": 82,
      "lead": "美股反弹，A股仍偏弱",
      "tags": [
        "DRIV",
        "LIT",
        "新能源车",
        "锂电池"
      ],
      "us": {
        "primary": "DRIV",
        "etfs": [
          "DRIV",
          "LIT",
          "HAIL"
        ],
        "returns": {
          "1d": 1.3,
          "5d": -5.9,
          "20d": -1.7,
          "60d": 28.7,
          "120d": 30.3,
          "ytd": 28.5
        },
        "rel": {
          "5d": -3.4,
          "20d": -1.9,
          "60d": 17.7,
          "120d": 21.9
        },
        "strength": {
          "short": 42,
          "mid": 53,
          "long": 87,
          "all": 64
        },
        "ema": {
          "ema5": -2.8,
          "ema20": -2.4,
          "ema60": 5.4,
          "ema120": 13.4,
          "emaYtd": 11.0
        }
      },
      "cn": [
        {
          "code": "515030",
          "name": "新能源车ETF华夏",
          "index": "中证新能源汽车指数",
          "returns": {
            "1d": -1.1,
            "5d": -4,
            "20d": -12.7,
            "60d": 5.5,
            "120d": 6
          },
          "rel": {
            "5d": -2,
            "20d": -1.1,
            "60d": 0.2,
            "120d": 1.7
          },
          "amount": 2.8,
          "mappingScore": 99,
          "status": "背离",
          "reasons": [
            "DRIV与新能源车主题匹配",
            "A股短期资金尚未确认",
            "适合观察是否补涨"
          ],
          "matchedTags": [
            "driv",
            "新能源",
            "新能源车",
            "汽车"
          ]
        },
        {
          "code": "516160",
          "name": "新能源ETF南方",
          "index": "中证新能源指数",
          "returns": {
            "1d": -0.5,
            "5d": -3.8,
            "20d": -9.5,
            "60d": 0.3,
            "120d": 8
          },
          "rel": {
            "5d": -1.1,
            "20d": 0.1,
            "60d": 1.5,
            "120d": 2.9
          },
          "amount": 1.9,
          "mappingScore": 85,
          "status": "背离",
          "reasons": [
            "覆盖锂电与新能源产业链",
            "主题更宽，映射纯度中等"
          ],
          "matchedTags": [
            "新能源",
            "锂电"
          ]
        }
      ]
    },
    {
      "id": "solar_clean",
      "name": "光伏/清洁能源",
      "signal": "背离",
      "confidence": 73,
      "lead": "海外清洁能源回暖，A股趋势仍弱",
      "tags": [
        "TAN",
        "ICLN",
        "光伏",
        "清洁能源"
      ],
      "us": {
        "primary": "TAN",
        "etfs": [
          "TAN",
          "ICLN"
        ],
        "returns": {
          "1d": -0.7,
          "5d": -10.6,
          "20d": 2.6,
          "60d": 16.1,
          "120d": 32.9,
          "ytd": 23.2
        },
        "rel": {
          "5d": -8.1,
          "20d": 2.4,
          "60d": 5.1,
          "120d": 24.5
        },
        "strength": {
          "short": 37,
          "mid": 48,
          "long": 79,
          "all": 58
        },
        "ema": {
          "ema5": -4.9,
          "ema20": -4.2,
          "ema60": 3.3,
          "ema120": 10.8,
          "emaYtd": 7.8
        }
      },
      "cn": [
        {
          "code": "515790",
          "name": "光伏ETF华泰柏瑞",
          "index": "中证光伏产业指数",
          "returns": {
            "1d": 0.9,
            "5d": -4.9,
            "20d": -1.9,
            "60d": -5.3,
            "120d": 11.1
          },
          "rel": {
            "5d": -3.1,
            "20d": -4.3,
            "60d": -1.8,
            "120d": -7.6
          },
          "amount": 4.9,
          "mappingScore": 88,
          "status": "背离",
          "reasons": [
            "TAN与光伏主题高度匹配",
            "A股产业链供给压力仍影响强弱",
            "需等待趋势确认"
          ],
          "matchedTags": [
            "tan",
            "光伏"
          ]
        }
      ]
    },
    {
      "id": "cyber_security",
      "name": "网络安全",
      "signal": "传导",
      "confidence": 73,
      "lead": "美股网络安全中期走强",
      "tags": [
        "CIBR",
        "BUG",
        "网络安全",
        "信息安全"
      ],
      "us": {
        "primary": "CIBR",
        "etfs": [
          "CIBR",
          "BUG"
        ],
        "returns": {
          "1d": -0.7,
          "5d": -8.5,
          "20d": 14.4,
          "60d": 31.9,
          "120d": 16.6,
          "ytd": 21.9
        },
        "rel": {
          "5d": -6.0,
          "20d": 14.2,
          "60d": 20.9,
          "120d": 8.2
        },
        "strength": {
          "short": 52,
          "mid": 73,
          "long": 99,
          "all": 78
        },
        "ema": {
          "ema5": -2.4,
          "ema20": 2.6,
          "ema60": 13.8,
          "ema120": 18.3,
          "emaYtd": 18.5
        }
      },
      "cn": [
        {
          "code": "512720",
          "name": "计算机ETF国泰",
          "index": "中证计算机主题指数",
          "returns": {
            "1d": -0.7,
            "5d": -2.9,
            "20d": -9.3,
            "60d": -1.6,
            "120d": 1.5
          },
          "rel": {
            "5d": 1.2,
            "20d": 3.4,
            "60d": 5.1,
            "120d": 8.8
          },
          "amount": 0.6,
          "mappingScore": 68,
          "status": "传导",
          "reasons": [
            "A股暂无高流动性纯网络安全ETF",
            "计算机ETF仅作为宽主题替代",
            "映射纯度低，需结合成份行业二次确认"
          ],
          "matchedTags": [
            "网络安全",
            "计算机"
          ]
        }
      ]
    },
    {
      "id": "aerospace_defense",
      "name": "航天军工",
      "signal": "背离",
      "confidence": 70,
      "lead": "国防航天主题同步强",
      "tags": [
        "ITA",
        "UFO",
        "航天",
        "军工",
        "卫星"
      ],
      "us": {
        "primary": "ITA",
        "etfs": [
          "ITA",
          "UFO",
          "ARKX"
        ],
        "returns": {
          "1d": -1.0,
          "5d": -1.2,
          "20d": 1.7,
          "60d": -1.8,
          "120d": 8.5,
          "ytd": 2.4
        },
        "rel": {
          "5d": 1.3,
          "20d": 1.5,
          "60d": -12.8,
          "120d": 0.1
        },
        "strength": {
          "short": 49,
          "mid": 51,
          "long": 53,
          "all": 51
        },
        "ema": {
          "ema5": -0.6,
          "ema20": 0.1,
          "ema60": 0.5,
          "ema120": 1.7,
          "emaYtd": 0.1
        }
      },
      "cn": [
        {
          "code": "512660",
          "name": "军工ETF国泰",
          "index": "中证军工指数",
          "returns": {
            "1d": 0.5,
            "5d": -3.8,
            "20d": -11,
            "60d": -15.6,
            "120d": 7.5
          },
          "rel": {
            "5d": 2.1,
            "20d": 4.8,
            "60d": 6.6,
            "120d": 7.7
          },
          "amount": 6.1,
          "mappingScore": 89,
          "status": "共振",
          "reasons": [
            "ITA与军工主题高度接近",
            "A股军工ETF流动性较好"
          ],
          "matchedTags": [
            "ita",
            "军工"
          ]
        }
      ]
    },
    {
      "id": "biotech",
      "name": "生物科技/创新药",
      "signal": "背离",
      "confidence": 73,
      "lead": "美股创新药改善，A股低位修复",
      "tags": [
        "IBB",
        "XBI",
        "生物科技",
        "创新药"
      ],
      "us": {
        "primary": "XBI",
        "etfs": [
          "IBB",
          "XBI"
        ],
        "returns": {
          "1d": -0.2,
          "5d": -3.9,
          "20d": -4.7,
          "60d": 4.7,
          "120d": 4.3,
          "ytd": 5.7
        },
        "rel": {
          "5d": -1.4,
          "20d": -4.9,
          "60d": -6.3,
          "120d": -4.1
        },
        "strength": {
          "short": 44,
          "mid": 44,
          "long": 53,
          "all": 48
        },
        "ema": {
          "ema5": -1.3,
          "ema20": -2.6,
          "ema60": -1.6,
          "ema120": 1.9,
          "emaYtd": -0.3
        }
      },
      "cn": [
        {
          "code": "159992",
          "name": "创新药ETF银华",
          "index": "中证创新药产业指数",
          "returns": {
            "1d": -1.7,
            "5d": -4.3,
            "20d": -12.4,
            "60d": -5.7,
            "120d": -16.8
          },
          "rel": {
            "5d": 0.6,
            "20d": 2.2,
            "60d": 3.3,
            "120d": 2.8
          },
          "amount": 5.6,
          "mappingScore": 98,
          "status": "传导",
          "reasons": [
            "XBI/IBB与创新药风险偏好相关",
            "A股创新药ETF主题纯度高"
          ],
          "matchedTags": [
            "ibb",
            "xbi",
            "创新药"
          ]
        },
        {
          "code": "512010",
          "name": "医药ETF易方达",
          "index": "沪深300医药卫生指数",
          "returns": {
            "1d": -1.8,
            "5d": -3.5,
            "20d": -10.3,
            "60d": -9.1,
            "120d": -16
          },
          "rel": {
            "5d": -0.1,
            "20d": 0.7,
            "60d": 1.8,
            "120d": 1.9
          },
          "amount": 6.7,
          "mappingScore": 51,
          "status": "传导",
          "reasons": [
            "医药宽基可作为低弹性替代",
            "创新药纯度不如159992"
          ],
          "matchedTags": [
            "创新药"
          ]
        }
      ]
    },
    {
      "id": "gold_metals",
      "name": "黄金/有色",
      "signal": "背离",
      "confidence": 67,
      "lead": "避险与资源品共振",
      "tags": [
        "GLD",
        "SLV",
        "黄金",
        "有色"
      ],
      "us": {
        "primary": "GLD",
        "etfs": [
          "GLD",
          "SLV",
          "PICK"
        ],
        "returns": {
          "1d": 0.3,
          "5d": -3.4,
          "20d": -8.4,
          "60d": -14.9,
          "120d": 0.5,
          "ytd": -0.3
        },
        "rel": {
          "5d": -0.9,
          "20d": -8.6,
          "60d": -25.9,
          "120d": -7.9
        },
        "strength": {
          "short": 41,
          "mid": 35,
          "long": 32,
          "all": 35
        },
        "ema": {
          "ema5": -1.5,
          "ema20": -3.9,
          "ema60": -6.3,
          "ema120": -5.3,
          "emaYtd": -6.8
        }
      },
      "cn": [
        {
          "code": "518880",
          "name": "黄金ETF华安",
          "index": "上海黄金现货实盘合约",
          "returns": {
            "1d": -1.4,
            "5d": -0.7,
            "20d": -5.2,
            "60d": -15.4,
            "120d": 1.3
          },
          "rel": {
            "5d": 0.8,
            "20d": 4.1,
            "60d": 8.6,
            "120d": 12.2
          },
          "amount": 30.2,
          "mappingScore": 93,
          "status": "共振",
          "reasons": [
            "GLD与国内黄金ETF直接映射",
            "商品属性明确",
            "流动性高"
          ],
          "matchedTags": [
            "gld",
            "黄金"
          ]
        },
        {
          "code": "512400",
          "name": "有色金属ETF南方",
          "index": "中证申万有色金属指数",
          "returns": {
            "1d": 0.8,
            "5d": 0.9,
            "20d": -7.6,
            "60d": -12.6,
            "120d": 15.7
          },
          "rel": {
            "5d": 1.5,
            "20d": 5.2,
            "60d": 9.7,
            "120d": 11
          },
          "amount": 12.7,
          "mappingScore": 99,
          "status": "共振",
          "reasons": [
            "SLV/PICK可映射有色资源",
            "与黄金并非一一对应但同属资源链"
          ],
          "matchedTags": [
            "slv",
            "有色",
            "黄金"
          ]
        }
      ]
    },
    {
      "id": "oil_energy",
      "name": "原油/能源",
      "signal": "共振",
      "confidence": 71,
      "lead": "能源价格短期上行",
      "tags": [
        "XLE",
        "USO",
        "原油",
        "能源"
      ],
      "us": {
        "primary": "XLE",
        "etfs": [
          "XLE",
          "USO"
        ],
        "returns": {
          "1d": 1.1,
          "5d": 1.8,
          "20d": 4.7,
          "60d": 1.4,
          "120d": 28.2,
          "ytd": 27.8
        },
        "rel": {
          "5d": 4.3,
          "20d": 4.5,
          "60d": -9.6,
          "120d": 19.8
        },
        "strength": {
          "short": 51,
          "mid": 53,
          "long": 68,
          "all": 58
        },
        "ema": {
          "ema5": 0.4,
          "ema20": 0.4,
          "ema60": 1.8,
          "ema120": 6.4,
          "emaYtd": 5.2
        }
      },
      "cn": [
        {
          "code": "159930",
          "index": "中证能源指数",
          "mappingScore": 84,
          "status": "共振",
          "reasons": [
            "A股能源主题ETF",
            "与XLE能源板块方向更接近",
            "适合作为能源行业替代映射"
          ],
          "name": "能源ETF汇添富",
          "amount": 1.2,
          "returns": {
            "1d": 2.1,
            "5d": 7,
            "20d": -1.4,
            "60d": -3,
            "120d": 21.9
          },
          "matchedTags": [
            "xle",
            "能源"
          ]
        },
        {
          "code": "159981",
          "index": "易盛郑商所能源化工指数",
          "mappingScore": 78,
          "status": "传导",
          "reasons": [
            "覆盖能源化工商品链条",
            "更偏商品价格映射",
            "适合观察油价与化工品传导"
          ],
          "name": "能源化工ETF建信",
          "amount": 3.6,
          "returns": {
            "1d": 1.5,
            "5d": 4.5,
            "20d": -5.3,
            "60d": 16.7,
            "120d": 32.8
          },
          "matchedTags": [
            "能源"
          ]
        },
        {
          "code": "515220",
          "index": "中证煤炭指数",
          "mappingScore": 54,
          "status": "传导",
          "reasons": [
            "煤炭属于传统能源分支",
            "与海外能源板块相关但不等同",
            "适合作为A股本土能源补充观察"
          ],
          "name": "煤炭ETF国泰",
          "amount": 20.2,
          "returns": {
            "1d": 3.9,
            "5d": 13.8,
            "20d": 5.9,
            "60d": 11.8,
            "120d": 27.4
          },
          "matchedTags": [
            "能源"
          ]
        }
      ]
    },
    {
      "id": "china_internet",
      "name": "中概互联网/港股科技",
      "signal": "共振",
      "confidence": 60,
      "lead": "同一资产跨市场定价",
      "tags": [
        "KWEB",
        "CQQQ",
        "恒生科技",
        "互联网"
      ],
      "us": {
        "primary": "KWEB",
        "etfs": [
          "KWEB",
          "CQQQ"
        ],
        "returns": {
          "1d": -1.0,
          "5d": -4.5,
          "20d": -11.6,
          "60d": -13.1,
          "120d": -29.2,
          "ytd": -26.7
        },
        "rel": {
          "5d": -2.0,
          "20d": -11.8,
          "60d": -24.1,
          "120d": -37.6
        },
        "strength": {
          "short": 38,
          "mid": 28,
          "long": 6,
          "all": 22
        },
        "ema": {
          "ema5": -2.2,
          "ema20": -5.2,
          "ema60": -9.8,
          "ema120": -15.4,
          "emaYtd": -13.8
        }
      },
      "cn": [
        {
          "code": "513180",
          "name": "恒生科技ETF华夏",
          "index": "恒生科技指数",
          "returns": {
            "1d": -1.7,
            "5d": 3.4,
            "20d": 0.8,
            "60d": 2.4,
            "120d": -15.3
          },
          "rel": {
            "5d": 3.8,
            "20d": 7.1,
            "60d": 10.8,
            "120d": 13.6
          },
          "amount": 35.2,
          "mappingScore": 99,
          "status": "共振",
          "reasons": [
            "KWEB与港股科技高度重合",
            "A股场内可交易且流动性强"
          ],
          "matchedTags": [
            "kweb",
            "恒生科技",
            "港股"
          ]
        },
        {
          "code": "513050",
          "name": "中概互联网ETF易方达",
          "index": "中证港股通互联网指数",
          "returns": {
            "1d": -2.5,
            "5d": 2.5,
            "20d": -3.9,
            "60d": -5.6,
            "120d": -25.3
          },
          "rel": {
            "5d": 4,
            "20d": 7.6,
            "60d": 11.4,
            "120d": 15.9
          },
          "amount": 29.7,
          "mappingScore": 99,
          "status": "共振",
          "reasons": [
            "互联网成份股匹配度高",
            "比恒生科技更偏互联网平台"
          ],
          "matchedTags": [
            "互联网",
            "恒生科技",
            "港股"
          ]
        }
      ]
    },
    {
      "id": "financials",
      "name": "金融/券商银行",
      "signal": "背离",
      "confidence": 74,
      "lead": "美股金融强，A股金融分化",
      "tags": [
        "XLF",
        "KBE",
        "银行",
        "券商"
      ],
      "us": {
        "primary": "XLF",
        "etfs": [
          "XLF",
          "KBE",
          "KRE"
        ],
        "returns": {
          "1d": -0.6,
          "5d": 1.0,
          "20d": 1.4,
          "60d": 6.4,
          "120d": -5.4,
          "ytd": -5.4
        },
        "rel": {
          "5d": 3.5,
          "20d": 1.2,
          "60d": -4.6,
          "120d": -13.8
        },
        "strength": {
          "short": 52,
          "mid": 52,
          "long": 51,
          "all": 52
        },
        "ema": {
          "ema5": 0.2,
          "ema20": 0.7,
          "ema60": 0.9,
          "ema120": 0.4,
          "emaYtd": 0.0
        }
      },
      "cn": [
        {
          "code": "512800",
          "name": "银行ETF华宝",
          "index": "中证银行指数",
          "returns": {
            "1d": -0.9,
            "5d": 2.1,
            "20d": -0.6,
            "60d": 0,
            "120d": -7
          },
          "rel": {
            "5d": -0.8,
            "20d": -0.1,
            "60d": 4.1,
            "120d": 8.9
          },
          "amount": 6.7,
          "mappingScore": 90,
          "status": "背离",
          "reasons": [
            "与KBE/KRE银行链条相关",
            "A股银行偏防御属性"
          ],
          "matchedTags": [
            "kbe",
            "银行"
          ]
        },
        {
          "code": "512070",
          "name": "证券保险ETF易方达",
          "index": "沪深300非银行金融指数",
          "returns": {
            "1d": 0,
            "5d": -0.1,
            "20d": -7.2,
            "60d": -10.5,
            "120d": -12
          },
          "rel": {
            "5d": -1.5,
            "20d": -0.8,
            "60d": 1.4,
            "120d": 3
          },
          "amount": 3.4,
          "mappingScore": 95,
          "status": "背离",
          "reasons": [
            "券商保险可映射XLF部分敞口",
            "短期相对弱"
          ],
          "matchedTags": [
            "xlf",
            "券商",
            "金融",
            "银行",
            "非银"
          ]
        }
      ]
    }
  ]
};
