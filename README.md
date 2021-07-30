# TinyServer

#### 1. 介绍
​		本地Python项目运行基础框架，无需安装第三方库，内置纯Python原生实现的多进程http服务器，可通过内置restful web api或网页查看本地日志，可定时执行代码，可进行消息通知，可定义服务器api查看运行状态，可自定义web模版。

#### 2. 主要功能
- 为服务器运行Python项目提供日志，配置管理
  - web网页查看日志
  - Restful api提供项目信息接口

- 定时执行模块，根据开始结束时间，定期执行/Core/main.py
- 消息通知模块，发送邮件或配合mirai框架发送QQ信息
- 服务器api
  - 可通过内置api查询程序信息与系统状态
  - 可自定义简易api
- 自定义web模版

#### 3. 基本模块

- Core
  - main.py - 程序执行的入口
- Config
  - config.ini - 填写基本配置信息
  - settings.py - 对config.ini中数据进行读取与初始化
- Logger
  - logger - 输出日志信息到控制台、日志文件与Server模块
- Message
  - message - 消息传递接口，可通过QQ机器人与邮箱发送信息
- Scheduler
  - scheduler - 定时执行模块，在config.ini 中开启并设置后，定时执行/Core/main.py中代码
- Server
  - handler - 包含主要的HTTP请求处理与api
  - server - 用于配置并启动服务器线程
- Static
  - web网页查看日志
  - Restful api提供项目信息接口

#### 4. 运行环境

- [Python 3](https://www.python.org/)

#### 5. 安装教程

1. ```shell
   git clone https://gitee.com/louisyoung1/tiny-server.git
   ```

2. ```sh
   cd tiny-server
   ```

#### 6. 使用说明

1. 修改/Core/main.py中代码，修改为你要运行的代码

2. 按注释要求编辑/Config/config.ini文件中配置项
   
3. 确保你此时在/tiny-server目录下，并运行

   ```sh
   python3 runserver
   ```

#### 7. 目录结构

```shell
.
├── Config
│   ├── config.ini
│   └── settings.py
├── Core
│   └── core.py
├── Logger
│   ├── Log_Files
│   │   └── TinyServer.log
│   └── logger.py
├── Message
│   └── message.py
├── Scheduler
│   ├── scheduler.py
│   └── tools.py
├── Server
│   ├── handler.py
│   └── server.py
├── Static
│   ├── 404.html
│   ├── change.html
│   ├── css
│   ├── favicon.ico
│   ├── images
│   ├── index.html
│   ├── js
│   └── log.html
└── runserver.py
```



#### 8. 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request
