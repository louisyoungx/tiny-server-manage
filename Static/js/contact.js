function Submit() {
    let Name = document.getElementsByClassName("glass-input")[0].value;
    let Email = document.getElementsByClassName("glass-input")[1].value;
    let QQ = document.getElementsByClassName("glass-input")[2].value;
    let Comment = document.getElementsByClassName("glass-input")[3].value;
    if (Name === "" || Email === "" || QQ === "" || Comment === "") {
        Swal.fire({
          type: 'error',
          title: '出错了...',
          text: '请填写完所有字段再提交',
        });
    } else {
        const userid = 1462648167;
        let message = `名字: ${Name} 邮箱: ${Email} QQ: ${QQ} 备注: ${Comment}`;
        console.log(message);
        const url = window.location.origin + "/api/contact?message=" + message;
        axios.get(url)
          .then(function (response) {
            console.log(response);
            Swal.fire({
              type: 'success',
              title: '提交成功',
              text: '看到会回复',
            });
          })
          .catch(function (error) {
            console.log(error);
            Swal.fire({
              type: 'error',
              title: '出错了...',
              text: error
            });
          });
    }
}
var url = 'http://0.0.0.0:12000/api/config'
axios.get(url)
  .then(function (response) {
    console.log(response);
  })
