from Server.api import log, systemInfo, activeInfo, serverConfig, appListInfo, switchAppStatus, appStatus, appLogger, appConfig, appCreate, appDelete, contact

def urls(url, request):
    if (url == "/log"): return log(request)
    elif (url == "/system-info"): return systemInfo(request)
    elif (url == "/active-info"): return activeInfo(request)
    elif (url == "/config"): return serverConfig(request)
    elif (url == "/app-list"): return appListInfo(request)
    elif (url == "/switch-app-status"): return switchAppStatus(request)
    elif (url == "/app-status"): return appStatus(request)
    elif (url == "/app-logger"): return appLogger(request)
    elif (url == "/app-config"): return appConfig(request)
    elif (url == "/app-create"): return appCreate(request)
    elif (url == "/app-delete"): return appDelete(request)
    elif (url == "/contact"): return contact(request)
    else: return "No Response"