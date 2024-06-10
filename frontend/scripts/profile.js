document.addEventListener('DOMContentLoaded', async function() {
    const tokenString = JSON.parse(localStorage.getItem('token'));
    const accessTokenRegex = /\"access_token\":\"(.*?)\"/;
    const token = tokenString.match(accessTokenRegex)[1];

    if (!token) {
        alert('请先登录');
        window.location.href = 'login.html'; // 如果未登录，跳转到登录页面
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
            document.getElementById('name').textContent = userInfo.name;
            document.getElementById('phoneNumber').textContent = userInfo.phoneNumber;
        } else {
            alert('获取用户信息失败: ' + (await userInfoResponse.json()).detail);
            window.location.href = 'login.html'; // 如果获取信息失败，跳转到登录页面
            return;
        }

        // 获取预约记录
        const appointmentResponse = await fetch('http://127.0.0.1:8000/users/appointments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (appointmentResponse.ok) {
            const appointments = await appointmentResponse.json();
            const appointmentList = document.getElementById('appointmentRecords');
            appointments.forEach(appointment => {
                const li = document.createElement('li');
                li.textContent = `预约时间: ${appointment.time}, 详情: ${appointment.details}`;
                appointmentList.appendChild(li);
            });
        } else {
            alert('获取预约记录失败: ' + (await appointmentResponse.json()).detail);
        }

        // 获取行程发布记录
        const tripResponse = await fetch('http://127.0.0.1:8000/users/trips', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (tripResponse.ok) {
            const trips = await tripResponse.json();
            const tripList = document.getElementById('tripRecords');
            trips.forEach(trip => {
                const li = document.createElement('li');
                li.textContent = `行程时间: ${trip.time}, 目的地: ${trip.destination}`;
                tripList.appendChild(li);
            });
        } else {
            alert('获取行程发布记录失败: ' + (await tripResponse.json()).detail);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('发生错误，请重试');
    }
});
