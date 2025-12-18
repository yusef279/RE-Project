async function test() {
    const baseURL = 'http://localhost:3001';
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${baseURL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'parent@example.eg',
                password: 'password123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const loginData = await loginRes.json();
        const token = loginData.access_token;
        console.log('Login successful!');

        console.log('Fetching children...');
        const childrenRes = await fetch(`${baseURL}/api/parent/children`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Status:', childrenRes.status);
        const data = await childrenRes.json();
        console.log('Data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

test();
