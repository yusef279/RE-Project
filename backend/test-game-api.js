async function testGameApi() {
    const email = 'parent@example.eg';
    const password = 'password123';
    const baseUrl = 'http://localhost:3001';

    try {
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        const token = loginData.access_token;

        const gameId = '69441cacb895c0a8b7d55548';

        console.log(`\n--- TESTING GAME: ${gameId} ---`);
        const res = await fetch(`${baseUrl}/api/games/${gameId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}
testGameApi();
