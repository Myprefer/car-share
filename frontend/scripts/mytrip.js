document.addEventListener('DOMContentLoaded', function () {
    loadMyTrips();

    async function loadMyTrips() {
        var userId; // 获取当前用户 ID 的函数，需要自己实现

        console.log('getCurrentUserId function called!');

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
                console.log(userInfo.id);
                userId = userInfo.id;
            } else {
                alert('获取用户信息失败');
                window.location.href = 'login.html'; // 如果获取信息失败，跳转到登录页面
            }
        } catch (error) {
            console.error('Error:', error);
        }

        // 获取已发布行程
        const publishedTrips = await fetchTrips(`http://127.0.0.1:8000/user_trips/${userId}`);
        displayTrips(publishedTrips);

        // 获取已预订行程
        const bookedTrips = await fetchTrips(`http://127.0.0.1:8000/user_bookings/${userId}`);
        displayBookings(bookedTrips);
    }

    async function fetchTrips(url) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return await response.json();
            } else {
                console.error('Failed to fetch trips:', response.statusText);
                return [];
            }
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    function displayTrips(trips) {
        const tripList = document.getElementById('trip-list');
        tripList.innerHTML = ''; // 清空当前内容

        trips.forEach(trip => {
            const tripCard = document.createElement('div');
            tripCard.className = 'trip-card';
            tripCard.innerHTML = `
                <h3>从 ${trip.departure} 到 ${trip.destination} </h3>
                <p>日期: ${trip.date}</p>
                <p>时间: ${trip.time}</p>
                <p>车主: ${trip.publish}</p>
                <p>价格: ¥${trip.price}</p>
<!--                <button class="edit-button" data-trip-id="${trip.trip_id}">编辑</button>-->
<!--                <button class="delete-button" data-trip-id="${trip.trip_id}">删除</button>-->
            `;
            tripList.appendChild(tripCard);
        });

        addEventListeners();
    }

    function displayBookings(trips) {
        const bookList = document.getElementById('book-list');
        bookList.innerHTML = ''; // 清空当前内容

        trips.forEach(trip => {
            const tripCard = document.createElement('div');
            tripCard.className = 'book-card';
            tripCard.innerHTML = `
                <h3>从 ${trip.departure} 到 ${trip.destination} </h3>
                <p>日期: ${trip.date}</p>
                <p>时间: ${trip.time}</p>
                <p>车主: ${trip.publish}</p>
                <p>价格: ¥${trip.price}</p>
<!--                <button class="cancel-button" data-booking-id="${trip.booking_id}">取消预订</button>-->
            `;
            bookList.appendChild(tripCard);
        });

        addEventListeners();
    }

    function addEventListeners() {
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function () {
                const tripId = this.dataset.tripId;
                editTrip(tripId);
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function () {
                const tripId = this.dataset.tripId;
                deleteTrip(tripId);
            });
        });

        document.querySelectorAll('.cancel-button').forEach(button => {
            button.addEventListener('click', function () {
                const bookingId = this.dataset.bookingId;
                cancelBooking(bookingId);
            });
        });
    }

    async function editTrip(tripId) {
        // 编辑行程的逻辑
        console.log('Editing trip:', tripId);
    }

    async function deleteTrip(tripId) {
        try {
            const response = await fetch(`/trips/${tripId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                console.log('Trip deleted:', tripId);
                loadMyTrips();
            } else {
                console.error('Failed to delete trip:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function cancelBooking(bookingId) {
        try {
            const response = await fetch(`/bookings/${bookingId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                console.log('Booking cancelled:', bookingId);
                loadMyTrips();
            } else {
                console.error('Failed to cancel booking:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

});
