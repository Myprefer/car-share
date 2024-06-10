function submitPost(event) {
    event.preventDefault();

    var input = document.getElementById('phoneNumber').value;

    var regex = /^1[3456789]\d{9}$/;

    if (!regex.test(input)) {
        alert("手机号格式错误!");
        location.reload();
    }

    var formData = new FormData(this);

    if (formData.get('password') !== formData.get('confirmPassword')) {
        alert('密码不一致');
        location.reload();
    }

    var password = formData.get('password');
    var hashedPassword = CryptoJS.MD5(password).toString();

    formData.set("password", hashedPassword)

    formData.delete('confirmPassword')

    var jsonData = {};
    formData.forEach(function (value, key) {
        jsonData[key] = value;
    });
    jsonData = JSON.stringify(jsonData);

    // 发送POST请求
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/register", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // 请求成功处理
            console.log(xhr.responseText);
            alert('注册成功!');
            window.location.href = './login.html';
        } else if (xhr.readyState === 4) {
            if (xhr.status === 401) {
                alert('账号已被注册或不符合规范');
                location.reload();
            } else {
                alert("请求失败：" + xhr.status);
                location.reload();
            }
        }
    };
    xhr.send(jsonData);
}

document.getElementById("registerForm").addEventListener("submit", submitPost);