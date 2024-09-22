
import { checkIfExists } from '../utils/helper';
import {expect,test} from 'vitest';
// test checkIfExists function from /utils/helper.js 
test('checkIfExists function', async () => {
    const result = await checkIfExists('username', 'testuser');
    expect(result).toBe(false);

    const result2 = await checkIfExists('email', 'johndoe1@gmail.com');
    expect(result2).toBe(false);

    const result3 = await checkIfExists('username', 'johndoe');
    expect(result3).toBe(true);


});

// test register route from /routes/register.js
test('register route', async () => {
    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Test User',
            email: 'demo@gmail.com',
            password: 'sha256life',
            username: 'johndoe'
        })
    });
    const data = await response.text();
    expect(data).toBe('User already exists');

    const response2 = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Test User',
            email: 'johndoe@demo.com',
            password: 'sha256life',
            username: 'testuser'
        })
    });
    const data2 = await response2.text();
    expect(data2).toBe('Email already exists');

    const response3 = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Test User',
            email: 'arbaazmir@icloud.com',
            password: 'sha256life',
            username: 'abdullah'
        })
    });
    const data3 = await response3.text();
    expect(data3).toBe('User registered successfully');
})


        




