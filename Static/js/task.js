const system_url = '/api/system-info'
const active_url = '/api/active-info'
const config_url = '/api/config'
const app_status_url = '/api/app-status' + window.location.search

let system_info = {}
let active_info = {}
let config_info = {}
let app_status_info = {}


run = function run() {
    console.log("===== start =====")
    before()
}

run()

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

    let system_get = ajaxPromise(system_url).then(data => {
        system_info = data
    })
    let active_get = ajaxPromise(active_url).then(data => {
        active_info = data
    })
    let config_get = ajaxPromise(config_url).then(data => {
        config_info = data
    })
    let app_status_get = ajaxPromise(app_status_url).then(data => {
        app_status_info = data
    })
    Promise.all([
        system_get,
        active_get,
        config_get,
        app_status_get])
        .then(() => {
            main()
        });
}

function main() {
    console.log("===== main =====")
    console.log(system_info)
    console.log(active_info)
    console.log(config_info)
    console.log(app_status_info)

    initTitle()

    changePage("overview")
}

function initTitle() {
    document.getElementById("head-title").innerHTML = app_status_info.name
}

function changePage(name) {
    let mount = document.getElementById("mount")
    if (name === "overview") {
        mount.innerHTML = overviewPage()
    } else if (name === "config") {
        configPage()
    } else if (name === "logger") {
        loggerPage()
    } else {
        console.error(name)
    }
}


function goMenu() {
    window.location = "/menu.html"
}

function goBack() {
    window.location = "/"
}

function goDelete() {
    Swal.fire({
        title: '确定删除' + app_status_info.name + "？",
        text: "此选项不可恢复",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '删除!'
    }).then((result) => {
        if (result.value === true) {
            deleteApp(app_status_info.name)
        }
    })
}

function taskPage(event) {
    let elem = event.path[0]
    let name = elem.name
    let selected = document.getElementsByClassName("model-button-selected")[0]
    selected.setAttribute("class", "model-button-item")
    elem.setAttribute("class", "model-button-item model-button-selected")
    changePage(name)
}

function deleteApp(name) {
    console.log(name)
    let url = '/api/app-delete?name=' + app_status_info.name
    axios.get(url)
        .then(function (response) {
            let res = response.data.data
            Swal.fire(
                '删除成功',
                app_status_info.name + '已被删除',
                res
            )
        }).catch((err) => {
        console.error(err);
    })
}



// config ***************************************

function configPage() {
    let mount = document.getElementById("mount")
    var url = "/api/app-config?name=" + app_status_info.name;
    let HTML = ""
    new Promise((resolve) => {
        axios.get(url)
            .then(function (response) {
                let res = response.data.data
                resolve(res);
            }).catch((err) => {
            console.error(err);
        })
    }).then((res) => {
        let params = res;
        for (let model in params) {
            HTML += `
            <div class="glass-card">
                <br>
                <p class="glass-title">${model}</p>
                <hr class="glass-hr">
                ${itemHTMLMake(params[model])}
                <br>
            </div>`
        }
        function itemHTMLMake(model) {
            let html = ""
            for (let item in model) {
                html += `<p class="glass-content">${item}: ${model[item]}</p>`
            }
            return html
        }
        mount.innerHTML = HTML
    })
}




// overview *************************************

function overviewPage() {
    let HTML = ""
    if (app_status_info.status === true) {
        HTML = template_active()
    } else {
        HTML = template_stopped()
    }
    return HTML
}

function template_active() {
    param = app_status_info

    let threads = ""
    let environ = ""
    let open_files = ""

    param.process.threads.forEach((thread) => {
        threads += `
            <div class="row-item">
                <p class="glass-content">${thread[0]}</p>
                <p class="glass-content">${thread[1]}</p>
                <p class="glass-content">${thread[2]}</p>
            </div>`
    })

    for (item in param.process.environ) {
        environ += `
            <div class="row-item">
                <p class="glass-content environ long-text">${item}</p>
                <p class="glass-content">:</p>
                <p class="glass-content environ long-text">"${param.process.environ[item]}"</p>
            </div>`
    }

    param.process.open_files.forEach((file) => {
        open_files += `
            <p class="glass-content long-text open-file">${file[0]}</p>`
    })

    return `
    <div class="glass-card">
        <br>
        <p class="glass-title">系统信息</p>
        <hr class="glass-hr">
        <p class="glass-content">名称: ${param.name}</p>
        <p class="glass-content">PID: ${param.pid}</p>
        <p class="glass-content">终端: ${param.process.terminal}</p>
        <p class="glass-content">状态: ${param.process.status}</p>
        <p class="glass-content">用户: ${param.process.username}</p>
        <p class="glass-content">启动时间: ${param.time}</p>
        <p class="glass-content">服务器: ${config_info.Server.server_name + '-' + config_info.Server.server_version}</p>
        <p class="glass-content">平台: ${system_info.platform}</p>
        <p class="glass-content">架构: ${system_info.machine}</p>
        <p class="glass-content">内核: ${system_info.version}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">启动命令</p>
        <hr class="glass-hr">
        <p class="glass-content long-text">执行路径: ${param.process.exe}</p>
        <p class="glass-content long-text">启动路径: ${param.path + '/' + param.launch_params.main}</p>
        <p class="glass-content long-text">启动参数: ${param.launch_params.args}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">CPU信息</p>
        <hr class="glass-hr">
        <p class="glass-content">百分比: ${param.process.cpu_percent}</p>
        <p class="glass-content">核心数: ${active_info.cpu_count}</p>
        <p class="glass-content">用户时间: ${param.process.cpu_times[0]}</p>
        <p class="glass-content">系统时间: ${param.process.cpu_times[1]}</p>
        <p class="glass-content">子用户: ${param.process.cpu_times[2]}</p>
        <p class="glass-content">子系统: ${param.process.cpu_times[3]}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">内存信息</p>
        <hr class="glass-hr">
        <p class="glass-content">百分比: ${param.process.memory_percent}</p>
        <p class="glass-content">实际内存: ${param.process.memory_info[0]}</p>
        <p class="glass-content">虚拟内存: ${param.process.memory_info[1]}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">并发</p>
        <hr class="glass-hr">
        <p class="glass-content">内核数: ${active_info.cpu_count}</p>
        <p class="glass-content">进程数: ${param.process.num_children}</p>
        <p class="glass-content">线程数: ${param.process.num_threads}</p>
        <p class="glass-content"></p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">线程</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
                <p class="glass-content">ID</p>
                <p class="glass-content">用户时间</p>
                <p class="glass-content">系统时间</p>
            </div>
            ${threads}
        </div>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">环境变量</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
                <p class="glass-content">变量名</p>
                <p class="glass-content">-</p>
                <p class="glass-content">变量值</p>
            </div>
            ${environ}
        </div>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">打开的文件</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
                ${open_files}
            </div>
        </div>
        <br>
    </div>
    `
}

function template_stopped() {
    param = app_status_info
    return `
    <div class="glass-card">
        <br>
        <p class="glass-title">系统信息</p>
        <hr class="glass-hr">
        <p class="glass-content">名称: ${param.name}</p>
        <p class="glass-content">服务器: ${config_info.Server.server_name + '-' + config_info.Server.server_version}</p>
        <p class="glass-content">平台: ${system_info.platform}</p>
        <p class="glass-content">架构: ${system_info.machine}</p>
        <p class="glass-content">内核: ${system_info.version}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">启动命令</p>
        <hr class="glass-hr">
        <p class="glass-content long-text">启动路径: ${param.path + '/' + param.launch_params.main}</p>
        <p class="glass-content long-text">启动参数: ${param.launch_params.args}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">CPU信息</p>
        <hr class="glass-hr">
        <p class="glass-content">核心数: ${active_info.cpu_count}</p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">内存信息</p>
        <hr class="glass-hr">
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">并发</p>
        <hr class="glass-hr">
        <p class="glass-content">内核数: ${active_info.cpu_count}</p>
        <p class="glass-content"></p>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">线程</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
                <p class="glass-content">ID</p>
                <p class="glass-content">用户时间</p>
                <p class="glass-content">系统时间</p>
            </div>
        </div>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">环境变量</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
                <p class="glass-content">变量名</p>
                <p class="glass-content">-</p>
                <p class="glass-content">变量值</p>
            </div>
        </div>
        <br>
    </div>
    <div class="glass-card">
        <br>
        <p class="glass-title">打开的文件</p>
        <hr class="glass-hr">
        <div class="row-list">
            <div class="row-item">
            </div>
        </div>
        <br>
    </div>
    `
}

// logger ***************************************

function loggerPage() {
    var url = "/api/app-logger?name=" + app_status_info.name;
    var content = "";

    const ajax = new Promise(function (resolve, reject) {
        axios
            .get(url)
            .then(function (response) {
                content = response.data.data;
                resolve(content);
            })
            .catch(function (error) {
                console.log(error);
                reject(error);
            });
    }).then(function (content) {
        console.log(content);
        let info = content.split("\n");

        const log_container = document.createElement("div");
        log_container.setAttribute("class", "log-contaniner");
        // for (let i = 0; i < 100; i++) {
        //   const item = document.createElement('div');
        //     item.id = 'item';
        //     log_container.appendChild(item);
        // }
        info.reverse(); // 反向迭代
        info.forEach((value, index, array) => {
            let time = value.substring(0, 21);
            let module = value.substring(21).split(":")[0];
            let content = value.substring(21 + module.length);

            let glass_item_list = document.createElement('div');
            glass_item_list.className = 'glass-item-list';

            let item_time = document.createElement('p');
            item_time.className = 'glass-item item-time';
            item_time.innerHTML = time;
            glass_item_list.appendChild(item_time);

            let item_module = document.createElement('span');
            item_module.className = 'glass-item item-module';
            item_module.innerHTML = module;
            glass_item_list.appendChild(item_module);

            let item_content = document.createElement('span');
            item_content.className = 'glass-item item-content';
            item_content.innerHTML = content;
            glass_item_list.appendChild(item_content);

            log_container.appendChild(glass_item_list);
        })
        let mount = document.getElementById("mount")
        mount.innerHTML = ""
        mount.appendChild(log_container)
    });
}

// const system_url = 'http://127.0.0.1:12000/api/system-info'
// const active_url = 'http://127.0.0.1:12000/api/active-info'
// const config_url = 'http://127.0.0.1:12000/api/config'
// const app_status_url = 'http://127.0.0.1:12000/api/app-status' + window.location.search
// const system_url = 'http://127.0.0.1:12000/api/system-info'
// const active_url = 'http://127.0.0.1:12000/api/active-info'
// const config_url = 'http://127.0.0.1:12000/api/config'
// const app_status_url = 'http://127.0.0.1:12000/api/app-status' + window.location.search
