function sleep(time) {
    var timeStamp = new Date().getTime();
    var endTime = timeStamp + time;
    while (true) {
        if (new Date().getTime() > endTime) {
            return;
        }
    }
}

sleep(2)

document.addEventListener('DOMContentLoaded', function () {
    sleep(2);
    // 绑定预订按钮事件
    const bookingButtons = document.querySelectorAll('.book-button');

    console.log(bookingButtons); // 检查是否正确获取到按钮元素

    bookingButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tripId = this.getAttribute('data-trip-id');
            bookTrip(tripId);
        });
    });
});

async function bookTrip(tripId) {
    console.log('Button clicked!');

    var userId; // 获取当前用户 ID 的函数，需要自己实现

    console.log('getCurrentUserId function called!');

    const tokenString = JSON.parse(localStorage.getItem('token'));
    const accessTokenRegex = /\"access_token\":\"(.*?)\"/;
    const token = tokenString.match(accessTokenRegex)[1];

    if (!token) {
        alert('请先登录');
        window.location.href = 'pages/login.html'; // 如果未登录，跳转到登录页面
        return;
    }


    try {
        // 获取用户信息
        const userInfoResponse = await fetch('http://127.0.0.1:8000/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            console.log(userInfo.id);
            userId = userInfo.id;
        } else {
            alert('获取用户信息失败');
            window.location.href = 'pages/login.html'; // 如果获取信息失败，跳转到登录页面
        }
    } catch (error) {
        console.error('Error:', error);
    }

    const bookingData = {
        trip_id: tripId,
        user_id: userId
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/book_trip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error:', errorData);
            alert('预订失败: ' + errorData.detail);
        } else {
            const data = await response.json();
            console.log('Booking successful:', data);
            alert('预订成功');
            location.reload();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('错误, 请重试');
    }
}
