import copy
import json
import platform
import urllib.parse

import psutil

from Config.settings import config
from Message.message import sendFriendMessage
from Task.task import task


def log(request):
    file_path = config.path() + config.settings("Logger", "FILE_PATH") + config.settings("Logger", "FILE_NAME")
    file_page_file = open(file_path, 'r')
    return str(file_page_file.read())

def systemInfo(request):
    info = {}
    info['platform'] = platform.platform()  # 获取操作系统名称及版本号，'Windows-7-6.1.7601-SP1'
    info['version'] = platform.version()  # 获取操作系统版本号，'6.1.7601'
    info['architecture'] = platform.architecture()  # 获取操作系统的位数，('32bit', 'WindowsPE')
    info['machine'] = platform.machine()  # 计算机类型，'x86'
    info['node'] = platform.node()  # 计算机的网络名称，'hongjie-PC'
    info['processor'] = platform.processor()  # 计算机处理器信息，'x86 Family 16 Model 6 Stepping 3, AuthenticAMD'
    info['uname'] = platform.uname()  # 包含上面所有的信息汇总，uname_result(system='Windows', node='hongjie-PC',
    return info

def activeInfo(request):
    info = {}
    # https://www.liaoxuefeng.com/wiki/1016959663602400/1183565811281984
    info['cpu_count'] = psutil.cpu_count()  # CPU逻辑数量
    info['cpu_percent'] = psutil.cpu_percent(interval=1)  # CPU使用率
    info['cpu_times'] = psutil.cpu_times()  # CPU的用户／系统／空闲时间
    info['virtual_memory'] = psutil.virtual_memory()  # 物理内存 total, available, percent, used, free, active, inactive, wired
    info['swap_memory'] = psutil.swap_memory()  # 交换内存 total, used, free, percent, sin, sout
    info['disk_partitions'] = psutil.disk_partitions() # 磁盘分区信息
    info['disk_usage'] = psutil.disk_usage('/') # 磁盘使用情况
    info['disk_io_counters'] = psutil.disk_io_counters() # 磁盘IO
    info['net_io_counters'] = psutil.net_io_counters() # 获取网络读写字节／包的个数
    info['net_if_addrs'] = psutil.net_if_addrs() # 获取网络接口信息
    info['net_if_stats'] = psutil.net_if_stats() # 获取网络接口状态
    info['disk_partitions'] = psutil.net_connections() # 获取当前网络连接信息
    return info

def serverConfig(request):
    appConfig = copy.deepcopy(config._config._sections)
    for model in appConfig:
        for item in appConfig[model]:
            appConfig[model][item] = eval(appConfig[model][item])
            value = appConfig[model][item]
            # DEBUG print(model, item, value, type(value))
    return appConfig

def appListInfo(request):
    return task.appListInfo()

def switchAppStatus(request):
    app = task.app(request["name"])
    if app.isRunning():
        app.stop()
    else:
        app.start()
    return app.runningStatus()

def appStatus(request):
    app = task.app(request["name"])
    return app.runningStatus()

def appLogger(request):
    app = task.app(request["name"])
    return app.log()

def appConfig(request):
    app = task.app(request["name"])
    return app.load_config()

def appCreate(request):
    mes = request["message"]
    data = eval(mes.replace("%22", "'"))

    if data["name"] == "" or data["exec_dir"] == "":
        return "no receive name or exec_dir"
    name = data["name"]
    exec_dir = data["exec_dir"]

    if data["environment"] == "":
        environment = "python3"
    else:
        environment = data["environment"]

    if data["main"] == "":
        main = "runserver.py"
    else:
        main = data["main"]

    if data["args"] == "":
        args = ""
    else:
        args = data["args"]

    if data["daemon"] == "":
        daemon = True
    else:
        daemon = eval(data["daemon"])

    if data["max_retry"] == "":
        max_retry = 10
    else:
        max_retry = eval(data["max_retry"])

    if data["config_file"] == "":
        config_file = "/Config/config.ini"
    else:
        config_file = data["config_file"]
    try:
        task.append(
            name=name,
            environment=environment,
            main=main,
            args=args,
            exec_dir=exec_dir,
            daemon=daemon,
            max_retry=max_retry,
            config_file=config_file,
            application=None)
    except Exception as e:
        return e
    return "Success"

def appDelete(request):
    name = request["name"]
    task.delete(name)
    return "success"

def contact(request_data):
    message = request_data["message"]
    message = urllib.parse.unquote(message)
    sendFriendMessage(message, 1462648167)
