const system_url = '/api/system-info'
const active_url = '/api/active-info'
const config_url = '/api/config'
const app_list_url = '/api/app-list'
const switch_app_status_url = '/api/switch-app-status'

let system_info = {}
let active_info = {}
let config_info = {}
let app_list_info = []

run()

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

    let system_get = ajaxPromise(system_url).then(data => {
        system_info = data
    })
    let active_get = ajaxPromise(active_url).then(data => {
        active_info = data
    })
    let config_get = ajaxPromise(config_url).then(data => {
        config_info = data
    })
    let app_list_get = ajaxPromise(app_list_url).then(data => {
        app_list_info = data
    })
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
}

// :param name 应用名称，同一个配置文件下唯一
// :param environment 环境名称
// :param main 启动主文件
// :param args 启动参数
// :param exec_dir 运行时目录
// :param daemon 进程守护
// :param max_retry 自动重启时的最大重试次数
// :param config_file 配置文件所在目录

function createApp() {
    let params = {}

    params["name"] = document.getElementsByClassName("glass-input")[0].value;
    params["exec_dir"] = document.getElementsByClassName("glass-input")[1].value;
    params["environment"] = document.getElementsByClassName("glass-input")[2].value;
    params["main"] = document.getElementsByClassName("glass-input")[3].value;
    params["args"] = document.getElementsByClassName("glass-input")[4].value;
    params["daemon"] = document.getElementsByClassName("glass-input")[5].value;
    params["max_retry"] = document.getElementsByClassName("glass-input")[6].value;
    params["config_file"] = document.getElementsByClassName("glass-input")[7].value;

    const url = window.location.origin + "/api/app-create?message=" + JSON.stringify(params);

    if (params["name"] === "" || params["exec_dir"] === "") {
        Swal.fire({
            type: 'error',
            title: '出错了...',
            text: '请填写完应用名称，运行目录再提交',
        });
    }

    console.log(params, url);

    axios.get(url)
        .then(function (response) {
            console.log(response);
            if (response.data.data === "Success") {
                window.location = "/task.html?name=" + params["name"]
            } else {
                Swal.fire({
                    type: 'error',
                    title: '出错了...',
                    text: response.data.data,
                });
            }

        })
        .catch(function (error) {
            Swal.fire({
                type: 'error',
                title: '出错了...',
                text: error,
            });
        });
}

function goBack() {
    window.location = "/";
}

// const system_url = 'http://0.0.0.0:12000/api/system-info'
// const active_url = 'http://0.0.0.0:12000/api/active-info'
// const config_url = 'http://0.0.0.0:12000/api/config'
// const app_list_url = 'http://0.0.0.0:12000/api/app-list'
// const switch_app_status_url = 'http://0.0.0.0:12000/api/switch-app-status'


