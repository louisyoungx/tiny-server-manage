const system_url = '/api/system-info'
const active_url = '/api/active-info'
const config_url = '/api/config'
const app_list_url = '/api/app-list'
const switch_app_status_url = '/api/switch-app-status'

let system_info = {}
let active_info = {}
let config_info = {}
let app_list_info = []

function run() {
  console.log("===== start =====")
  before()
}

function before() {
  console.log("===== before =====")
  const ajaxPromise = (url) => {
    return new Promise((resolve) => {
      axios.get(url)
        .then(function (response) {
          let res = response.data.data
          resolve(res);
        }).catch((err) => {
          console.error(err);
        })
    })
  }

  let system_get = ajaxPromise(system_url).then(data => { system_info = data })
  let active_get = ajaxPromise(active_url).then(data => { active_info = data })
  let config_get = ajaxPromise(config_url).then(data => { config_info = data })
  let app_list_get = ajaxPromise(app_list_url).then(data => { app_list_info = data })
  Promise.all([
    system_get,
    active_get,
    config_get,
    app_list_get])
    .then(() => {
      main()
    });
}

function main() {
  console.log("===== main =====")
  console.log(system_info)
  console.log(active_info)
  console.log(config_info)
  console.log(app_list_info)
  chartInit()
  titleInit()
  appListInit()
}

function appListInit() {
  let HTML_LIST = []
  app_list_info.forEach((app) => {
    let appConf = formatConfig(app)
    HTML_LIST.push(template(appConf))
  })
  mountHTML(HTML_LIST)
}

function titleInit() {
  const elem_server = document.getElementById("server-version")
  const elem_platform = document.getElementById("platform-machine")
  elem_server.innerHTML = "·" + config_info.Server.server_name + '-' + config_info.Server.server_version
  elem_platform.innerHTML = "·" + system_info.platform
}

function chartInit() {
  elem_cpu_mem_update()
  chartGauge(active_info.cpu_percent, active_info.virtual_memory[2])
}

function formatConfig(app) {
  let appConf = {}
  appConf.title = app.name
  appConf.path = app.path
  if (app.status === true) {
    appConf.app_situation = "app-running"
    appConf.text_situation = "运行中"
    appConf.last_time = "0天前"
    appConf.app_sign = "app-sign-run"
    appConf.cpu_percent = (app.process.cpu_percent.toFixed(2)).toString() + "%"
    appConf.virtual_memory = ((app.process.memory_info[0] / 1024 / 1024).toFixed(2)).toString() + "MB"
    appConf.cpu_progress = (app.process.cpu_percent * 2).toString() + "%"
    appConf.mem_progress = (app.process.memory_percent * 2).toString() + "%"
  } else {
    appConf.app_situation = "app-stop"
    appConf.text_situation = "已停止"
    appConf.last_time = "未启动"
    appConf.app_sign = "app-sign-stop"
    appConf.cpu_percent = "0%"
    appConf.virtual_memory = "0MB"
    appConf.cpu_progress = "0%"
    appConf.mem_progress = "0%"
  }
  console.log(appConf)
  return appConf
}

function mountHTML(HTML_LIST) {
  let application_list = document.createElement("div")
  application_list.setAttribute("class", "application-list")
  HTML_LIST.forEach((HTML) => {
    let application_container = document.createElement("div")
    application_container.setAttribute("class", "application-container")
    application_container.innerHTML = HTML
    application_list.appendChild(application_container)
  })
  model_app = document.getElementById("model-app")
  standby = document.getElementById("application-list")
  model_app.replaceChild(application_list, standby)
}

function elem_cpu_mem_update() {
  let cpu_percent = active_info.cpu_percent.toString() + "%"
  let virtual_memory = ((active_info.virtual_memory[3] / 1024 / 1024 / 1024).toFixed(2)).toString() + "GB"
  document.getElementById("title-CPU").innerHTML = "CPU: " + cpu_percent
  document.getElementById("title-Memory").innerHTML = "内存: " + virtual_memory
}

function chartGauge(chart_1, chart_2) {
  const gauge = liquidFillGaugeDefaultSettings();
  // gauge.circleColor = "#808015";
  // gauge.textColor = "#555500";
  // gauge.waveTextColor = "#FFFFAA";
  // gauge.waveColor = "#AAAA39";
  gauge.circleThickness = 0.1;
  gauge.circleFillGap = 0.1;
  gauge.textVertPosition = 0.4;
  gauge.waveAnimateTime = 2000;
  gauge.waveHeight = 0.2;
  gauge.waveCount = 1;
  loadLiquidFillGauge("fillgauge-1", chart_1, gauge);
  loadLiquidFillGauge("fillgauge-2", chart_2, gauge);
}

function template(appConf) {
  return `
    <div class="app-config-info" name="${appConf.title}" onClick="goTask(event)">
        <div class="app-config-info-left">
            <p class="app-title">${appConf.title}</p>
            <p class="app-path">${appConf.path}</p>
        </div>
        <div class="app-config-info-right">
            <p class="${appConf.app_situation}" id="app-text-sign">${appConf.text_situation}</p>
            <p class="app-time">${appConf.last_time}</p>
        </div>
        <div class="app-config-info-sign">
            <div class="app-sign ${appConf.app_sign}" name="${appConf.title}" onclick="switchStatus(event)"></div>
        </div>
    </div>
    <div class="app-active-info" name="${appConf.title}" onClick="goTask(event)">
        <div class="progress-title">
            <p class="glass-content">CPU：${appConf.cpu_percent}</p>
            <p class="glass-content">内存：${appConf.virtual_memory}</p>
        </div>
        <div class="progress-container">
            <div class="progress">
                <div class="progress-bar" id="cpu-progress" style="width: ${appConf.cpu_progress}"></div>
            </div>
            <div class="progress">
                <div class="progress-bar" id="mem-progress" style="width: ${appConf.mem_progress}"></div>
            </div>
        </div>
    </div>
  `
}
run();

function goMenu() {
  window.location = "/menu.html"
}

function goCreate() {
  window.location = "/create.html"
}

function switchStatus(event) {
  let name = event.path[0].getAttribute("name")
  parent = event.path[4]
  standby = event.path[3]
  new Promise((resolve, reject) => {
    axios.get(switch_app_status_url + "?name=" + name)
      .then((res) => {
        console.log(res.data.data)
        resolve(res.data.data);
      })
      .catch((err) => {
        reject(err);
      })
  }).then((params) => {
    let appConf = formatConfig(params)
    HTML = template(appConf)
    let application_container = document.createElement("div")
    application_container.setAttribute("class", "application-container")
    application_container.innerHTML = HTML
    parent.replaceChild(application_container, standby)
  })
}

function goTask(event) {
  if (event.path[0].classList[0] != "app-sign") {
    let name;
    event.path.forEach((path) => {
      try {
        if (path.getAttribute("name") != null) {
          name = path.getAttribute("name")
        }
      } catch (error) {
      }
    })
    let url = "/task.html?name=" + name
    if (name != "") window.location = url
    console.log(name, event)

  }
}

// const system_url = 'http://0.0.0.0:12000/api/system-info'
// const active_url = 'http://0.0.0.0:12000/api/active-info'
// const config_url = 'http://0.0.0.0:12000/api/config'
// const app_list_url = 'http://0.0.0.0:12000/api/app-list'
// const switch_app_status_url = 'http://0.0.0.0:12000/api/switch-app-status'


