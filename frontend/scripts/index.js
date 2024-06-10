document.addEventListener('DOMContentLoaded', () => {
    const tripList = document.getElementById('trip-list');
    const searchForm = document.getElementById('search-form');

    // 获取所有可预约行程
    fetch('http://localhost:8000/trips')
        .then(response => response.json())
        .then(data => {
            displayTrips(data);
        })
        .catch(error => console.error('Error:', error));

    // 搜索行程
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const departure = document.getElementById('departure').value;
        const destination = document.getElementById('destination').value;
        const date = document.getElementById('date').value;
        // const time = document.getElementById('time').value;

        const searchCriteria = {departure, destination, date};

        fetch('http://localhost:8000/search_trips', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchCriteria),
        })
            .then(response => response.json())
            .then(data => {
                tripList.innerHTML = ''; // 清空之前的行程
                displayTrips(data);
            })
            .catch(error => console.error('Error:', error));
    });

    // 显示行程函数
    function displayTrips(trips) {
        trips.forEach(trip => {
            const tripCard = document.createElement('div');
            tripCard.className = 'trip-card';

            tripCard.innerHTML = `
                <h3>从 ${trip.departure} 到 ${trip.destination}</h3>
                <p>日期: ${trip.date}</p>
                <p>时间: ${trip.time}</p>
                <p>发布: ${trip.publish}</p>
                <p>价格: ¥${trip.price}</p>
                <p>余座: ${trip.seats_available}</p>
                <button class="book-button" data-trip-id="${trip.trip_id}">立即预订</button>
            `;

            tripList.appendChild(tripCard);

            tripCard.querySelector('.book-button').addEventListener('click', function () {
                const tripId = this.getAttribute('data-trip-id');
                bookTrip(tripId);
            });
        });
    }
});
