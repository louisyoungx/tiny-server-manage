import json
import os
import sys
import time
import asyncio
import threading

from Task.application import Application
from Config.settings import config
from Logger.logger import logger

class TaskManager(object):

    appList = []
    cache = []

    def __init__(self):
        self.cache_path = config.path() + config.settings("Task", "CACHE_FILE_PATH")
        self.cache_file = self.cache_path + "TaskList.json"
        self.initialize()

    def initialize(self):
        if self.loadCache() is None:
            return
        else:
            self.loadApps()

    def loadCache(self):
        if os.path.exists(self.cache_file):
            with open(self.cache_file, "r") as cache:
                self.cache = json.load(cache)
                return self.cache
        else:
            return None

    def saveCache(self):
        if not os.path.exists(self.cache_path):
            os.mkdir(self.cache_path)
        with open(self.cache_file, "w") as cache:
            cache.seek(0)
            cache.truncate()  # 清空文件
            cache.write(json.dumps(self.cache))
            return

    def loadApps(self):
        cache = []
        for appConf in self.cache:
            try:
                application = Application(
                    name=appConf["name"],
                    environment=appConf["environment"],
                    main=appConf["main"],
                    args=appConf["args"],
                    exec_dir=appConf["exec_dir"],
                    daemon=appConf["daemon"],
                    max_retry=appConf["max_retry"],
                    config_file=appConf["config_file"]
                )
                self.appList.append(application)
                cache.append(application.launchParams())
            except Exception as e:
                logger.error(e)
        self.cache = cache
        self.saveCache()

    def append(
            self,
            name="",
            environment="python3",
            main="runserver.py",
            args="",
            exec_dir="",
            daemon=True,
            max_retry=10,
            config_file="/Config/config.ini",
            application=None):

        if name != "" and application == None:
            app = Application(
                name,
                environment=environment,
                main=main,
                args=args,
                exec_dir=exec_dir,
                daemon=daemon,
                max_retry=max_retry,
                config_file=config_file
            )
            self.appList.append(app)
            self.cache.append(app.launchParams())
            self.saveCache()
        else:
            self.appList.append(application)
            self.cache.append(application.launchParams())
            self.saveCache()

    def app(self, name):
        for app in self.appList:
            if app.name == name:
                return app
        return None

    def delete(self, name):
        for app in self.cache:
            if app["name"] == name:
                self.cache.remove(app)
                self.saveCache()
                break
        for app in self.appList:
            if app.name == name:
                self.appList.remove(app) #从队列移除
                if app.isRunning():
                    app.stop() # 杀进程
                app = None # 释放资源
                return True
        return False

    def startAll(self):
        startTime = time.time()
        for app in self.appList:
            try:
                app.start()
            except Exception as e:
                logger.error("App {} Start Failed".format(app.name))
                logger.error(e)
        EndTime = time.time()
        logger.info("All Application Started in {} Seconds".format(EndTime -startTime ))

    def stopAll(self):
        startTime = time.time()
        for app in self.appList:
            try:
                app.stop()
            except Exception as e:
                logger.error("App {} Stop Failed".format(app.name))
                logger.error(e)
        EndTime = time.time()
        logger.info("All Application Stopped in {} Seconds".format(EndTime -startTime ))

    def restart(self):
        startTime = time.time()
        self.stopAll()
        self.startAll()
        EndTime = time.time()
        logger.info("All Application Restarted in {} Seconds".format(EndTime -startTime ))

    def close(self):
        startTime = time.time()
        self.stopAll()
        EndTime = time.time()
        logger.info("System Closed in {} Seconds".format(EndTime -startTime ))
        sys.exit(0)

    def appListInfo(self):
        """负载信息
        :return info: dict
        """
        start = time.time()
        threadList = []
        result = [None] * len(self.appList)
        for i in range(len(self.appList)):
            app = self.appList[i]
            this = threading.Thread(target=self.appStatus, args=(app, result, i))
            threadList.append(this)
            this.setDaemon(True)
            this.start()
        for this in threadList:
            this.join()
        return result
    

    def appStatus(self, app, res, i):
        res[i] = app.runningStatus()

task = TaskManager()

# if __name__ == '__main__':
#     name = "TinyServer"
#     path = "/Users/ericaaron/Developer/Python/Default/TinyServer"
#     taskManager = TaskManager()
#     taskManager.append(name=name, exec_dir=path)
#     print(taskManager.appList)
#     app = taskManager.app(name)
#     app.start()
#     print(app.pid())
#     print(app.isRunning())
#     time.sleep(2)
#     print(taskManager.appListInfo())
#     taskManager.stopAll()
#     print(app.pid())

# if __name__ == '__main__':
#     taskManager = TaskManager()
#     print(taskManager.appList)
#     taskManager.startAll()
#     time.sleep(2)
#     print(taskManager.appListInfo())
#     taskManager.stopAll()

