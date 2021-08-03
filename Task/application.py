import os
import configparser
import copy
import subprocess
import time

import psutil

from Logger.logger import logger
from Config.settings import config

class Application(object):

    name = ""
    environment = ""
    main = ""  # 主文件
    args = ""  # 启动参数
    exec_dir = ""  # 执行目录
    config_file = "" # 设置目录
    daemon = True
    status = 0
    config = None
    process = None
    last_time = None
    cpu_percent = 0
    mem_bytes = 0

    def __init__(
            self,
            name,
            environment="python3",
            main="runserver.py",
            args="",
            exec_dir="",
            daemon=True,
            max_retry=10,
            config_file="/Config/config.ini"):

        """初始化应用
        :param name 应用名称，同一个配置文件下唯一
        :param environment 环境名称
        :param main 启动主文件
        :param args 启动参数
        :param exec_dir 运行时目录
        :param daemon 进程守护
        :param max_retry 自动重启时的最大重试次数
        :param config_file 配置文件所在目录
        :return Application / None
        """

        self.name = name
        self.environment = environment
        self.main = main
        self.args = args
        self.exec_dir = exec_dir
        self.daemon = daemon
        self.max_retry = max_retry
        self.status = 1
        self.config_file = config_file
        self.DEBUG = config.settings("Debug", "DEBUG")
        self.initialize()

    def initialize(self):
        """初始化"""
        if not self.check_exec_dir():
            self.status = 0
            return
        else:
            self.status = 1

        self.config = self.load_config()

    def check_exec_dir(self):
        """查看工作目录是否存在，且是一个TinyServer应用
        :return True / False
        """
        if not os.path.exists(self.exec_dir):
            error = "APP-{} Work Directory Do Not Exist: {}".format(self.name, self.exec_dir)
            logger.error(error)
            raise Exception(error)
        elif not os.path.exists(self.exec_dir + "/" + self.main):
            error = "APP-{} Main File Do Not Exist: {}".format(self.name, self.main)
            logger.error(error)
            raise Exception(error)
        elif self.config_file != "" and not os.path.exists(self.exec_dir + self.config_file):
            error = "APP-{} Config File Do Not Exist: {}".format(self.name, self.config_file)
            logger.error(error)
            raise Exception(error)
        else:
            return True

    def load_config(self):
        """获取应用配置
        :return appConfig: dict
        """
        config = configparser.ConfigParser()
        config.read(self.exec_dir + self.config_file, encoding='utf-8-sig')
        appConfig = copy.deepcopy(config._sections)
        for model in appConfig:
            for item in appConfig[model]:
                appConfig[model][item] = eval(appConfig[model][item])
                value = appConfig[model][item]
                # DEBUG print(model, item, value, type(value))
        return appConfig

    def start(self, timeout=3):
        """开启子进程
        :return process :subprocess对象
        """
        start_path = self.exec_dir + "/" + self.main
        # command = "{} {}".format(self.environment, start_path)
        args = []

        if self.environment != "":
            args.append(self.environment)
        else:
            args.append(start_path)
            args.append(self.args)

        process = subprocess.Popen(args, shell=False, cwd=self.exec_dir)
        self.process = process
        self.status = 1
        self.last_time = self.getTime()

    def poll(self):
        """查看进程是否终止
        :return returncode: 终止代码
        :return None: 未终止
        """
        if self.status == 0:
            return -1
        elif self.process is not None:
            return self.process.poll()
        else:
            return 0

    def isRunning(self):
        """查看进程是否终止
        :return True / False
        """
        if self.poll() == None:
            return True
        else:
            return False

    def stop(self):
        """杀进程"""
        self.process.kill()
        self.status = 0

    def pid(self):
        """查看进程PID
        :return PID: 进程ID
        :return -1: 进程已终止
        """
        if self.isRunning():
            return self.process.pid
        else:
            return -1

    def log(self):
        """返回日志文件
        :return log: 日志
        """
        if self.config_file == "":
            log_file = config.path() + config.settings("Logger", "FILE_PATH") + self.name + ".log"
        else:
            log_file = self.exec_dir + self.config["Logger"]["file_path"] + self.config["Logger"]["file_name"]
        with open(log_file) as file:
            content = file.read()
        return content

    def launchParams(self):
        params = {}
        params["name"] = self.name
        params["environment"] = self.environment
        params["main"] = self.main
        params["args"] = self.args
        params["exec_dir"] = self.exec_dir
        params["daemon"] = self.daemon
        params["max_retry"] = self.max_retry
        params["config_file"] = self.config_file
        return params

    def get_process_info(self):
        """负载信息
        :return info: dict
        """
        info = {}
        if self.isRunning():
            psutil_process = psutil.Process(self.pid())
            info['exe'] = psutil_process.exe() # 进程exe路径
            info['cwd'] = psutil_process.cwd() # 进程工作目录
            info['cmdline'] = psutil_process.cmdline() # 进程启动的命令行
            info['num_children'] = len(psutil_process.children()) # 子进程数量
            info['status'] = psutil_process.status()  # 进程状态
            info['username'] = psutil_process.username() # 进程用户名
            info['create_time'] = psutil_process.create_time() # 进程创建时间
            info['terminal'] = psutil_process.terminal() # 进程终端
            info['cpu_times'] = psutil_process.cpu_times() # 进程使用的CPU时间 user, system, children_user, children_system
            info['memory_info'] = psutil_process.memory_info() # 进程使用的内存(bytes) rss, vms, pfaults, pageins
            info['open_files'] = psutil_process.open_files() # 进程打开的文件
            info['connections'] = psutil_process.connections() # 进程相关网络连接
            info['num_threads'] = psutil_process.num_threads() # 进程的线程数量
            info['environ'] = psutil_process.environ() # 进程环境变量
            info['cpu_percent'] = psutil_process.cpu_percent(interval=1) # 进程的CPU使用率
            info['memory_percent'] = psutil_process.memory_percent() # 进程的内存使用率
            try: info['threads'] = psutil_process.threads() # 所有线程信息 id, user_time, system_time
            except: pass
        return info

    def runningStatus(self):
        info = {}
        info["name"] = self.name
        info["pid"] = self.pid()
        info["path"] = self.exec_dir
        info["status"] = self.isRunning()
        info["time"] = self.last_time
        info["process"] = self.get_process_info()
        info["launch_params"] = self.launchParams()
        return info

    def getTime(self):
        localtime = time.localtime(time.time())
        date = \
            localtime.tm_year.__str__() + '-' + \
            localtime.tm_mon.__str__() + '-' + \
            localtime.tm_mday.__str__() + ' ' + \
            localtime.tm_hour.__str__() + ':' + \
            localtime.tm_min.__str__() + ':' + \
            localtime.tm_sec.__str__()
        return date

# if __name__ == '__main__':
#     path = "/Users/ericaaron/Developer/Python/Default/TinyServer"
#     app = Application(name="TinyServer", exec_dir=path)
#     app.start()
#     app.runningStatus()
#     print(app.pid())
#     print(app.poll())
#     time.sleep(2)
#     print(app.get_process_info())
#     app.stop()
#     print(app.poll())
#     print(app.isRunning())
#     print(app.log())






