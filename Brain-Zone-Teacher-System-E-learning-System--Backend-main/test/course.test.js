import {expect,test} from 'vitest'

//test route /course/create
test('course route', async () => {
    const response = await fetch('http://localhost:3000/course/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            courseID: 'CS101',
            courseName: 'Computer Science',
            courseDescription: "This is a test course",
            courseInstructor: "John Doe",
            created_at: "2021-12-12",
            updated_at: "2021-12-12",
            userID: 123,
            courseStatus: "active",
            courseImage: "https://www.google.com",
            username: "johndoe"
        })
    });
    const data = await response.text();
    expect(data).toBe('Course created successfully');
});

