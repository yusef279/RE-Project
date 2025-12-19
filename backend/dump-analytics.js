async function testDetailApis() {
    const email = 'teacher@school.eg';
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

        const classroomsRes = await fetch(`${baseUrl}/api/teacher/classrooms`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const classrooms = await classroomsRes.json();

        if (classrooms.length > 0) {
            const cid = classrooms[0].id;

            console.log('\n--- ANALYTICS FULL DUMP ---');
            const analyticsRes = await fetch(`${baseUrl}/api/teacher/classrooms/${cid}/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const analyticsData = await analyticsRes.json();
            console.log(JSON.stringify(analyticsData, null, 2));
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}
testDetailApis();
