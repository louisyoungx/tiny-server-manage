let title = document.getElementsByTagName("title")[0]
let buttom = document.getElementById("buttom-title")

axios.get('/api/config')
    .then(function (response) {
        let res = response.data.data
        title.innerText = title.innerText + " | " + res.Information.author
        buttom.innerText = res.Information.author + " | " + res.Information.time.slice(0, 4) +  " | " + res.Server.server_host
    }).catch((err) => {
    console.error(err);
})
