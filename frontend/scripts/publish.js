document.getElementById('publishForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const form = document.getElementById('publishForm');

    const tokenString = JSON.parse(localStorage.getItem('token'));
    const accessTokenRegex = /\"access_token\":\"(.*?)\"/;
    const token = tokenString.match(accessTokenRegex)[1];

    if (!token) {
        alert('请先登录');
        window.location.href = 'login.html'; // 如果未登录，跳转到登录页面
        return;
    }

    const formData = new FormData(form);
    const data = {
        departure: formData.get('departure'),
        destination: formData.get('destination'),
        stops: formData.get('stops'),
        date: formData.get('date'),
        time: formData.get('time'),
        seats_available: formData.get('seats'),
        price: formData.get('price'),
        notes: formData.get('notes')
    };


    try {
        const response = await fetch('http://127.0.0.1:8000/publish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Trip published successfully:', result);
        alert('行程发布成功!');
        form.reset();
    } catch (error) {
        console.error('Error publishing trip:', error);
        alert('行程发布失败，请重试。');
    }
});