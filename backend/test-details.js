async function testDetailApis() {
    const email = 'teacher@school.eg';
    const password = 'password123';
    const baseUrl = 'http://localhost:3001';

    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const loginData = await loginRes.json();
        const token = loginData.access_token;
        console.log('Login successful!');

        console.log('Fetching classrooms...');
        const classroomsRes = await fetch(`${baseUrl}/api/teacher/classrooms`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const classrooms = await classroomsRes.json();
        console.log('Classrooms found:', classrooms.length);

        if (classrooms.length > 0) {
            const cid = classrooms[0].id; // uses 'id' from virtuals/normalization
            const cidReal = classrooms[0]._id;
            console.log(`Testing with classroom ID: ${cid} (real: ${cidReal})`);

            console.log('\n--- Testing Detail ---');
            const detailRes = await fetch(`${baseUrl}/api/teacher/classrooms/${cid}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            console.log('Detail Status:', detailRes.status);
            if (detailRes.status !== 200) console.log('Detail Error:', await detailRes.json());

            console.log('\n--- Testing Analytics ---');
            const analyticsRes = await fetch(`${baseUrl}/api/teacher/classrooms/${cid}/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            console.log('Analytics Status:', analyticsRes.status);
            if (analyticsRes.status !== 200) console.log('Analytics Error:', await analyticsRes.json());

            console.log('\n--- Testing Leaderboard ---');
            const leaderboardRes = await fetch(`${baseUrl}/api/teacher/classrooms/${cid}/leaderboard`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            console.log('Leaderboard Status:', leaderboardRes.status);
            if (leaderboardRes.status !== 200) console.log('Leaderboard Error:', await leaderboardRes.json());
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testDetailApis();
