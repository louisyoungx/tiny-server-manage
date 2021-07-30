axios.get('/api/config')
    .then(function (response) {
      let res = response.data.data
      info = document.getElementById("header-subtitle")
      info.innerText = res.Information.author + " | " + res.Information.time.slice(0, 4) +  " | " + res.Server.server_host
    }).catch((err) => {
  console.error(err);
})

function goLogs() {
  self.location= window.location.origin + '/log.html';
}

function goHome() {
  self.location= window.location.origin + '/index.html';
}

function goContact() {
  self.location= window.location.origin + '/contact.html';
}

// function goLogs() {
//   self.location= window.location.origin + '/log.html';
// }
//
// function goHome() {
//
// }
//
// function goChange() {
//   self.location= window.location.origin + '/change.html';
// }
//
