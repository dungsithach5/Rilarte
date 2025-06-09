'use client'
import './login.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
       if (email === '' || password === '') {
            alert('Please fill in all fields');
        } else if (!email.includes('@')) {
            alert('Please enter a valid email address');
        } else if (password.length < 6) {
            alert('Password must be at least 6 characters long');
        } else {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                alert('Login successful');
                router.push('/home');
            } catch (error) {
                alert('Login failed. Please try again.');
            }
        }

    }
    return (
        <div className="login-wrapper">
      <div className="login-left">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login to your account</h2>
          <label>Email</label>
          <input
            type="email"
            placeholder="balamia@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="password-row">
            <label>Password</label>
            <a href="#">Forgot?</a>
          </div>
          <input type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login now</button>
          <p className="signup-link">
            Don’t Have An Account? <a href="/register">Register</a>
          </p>
        </form>
      </div>
      <div className="login-right">
        <video  
            autoPlay
            loop
            muted src="https://media.istockphoto.com/id/1363217414/vi/video/m%C3%A0u-x%C3%A1m-tr%E1%BA%AFng-m%E1%BB%8Bn-b%C3%B3ng-g%E1%BB%A3n-s%C3%B3ng-n%E1%BB%81n-chuy%E1%BB%83n-%C4%91%E1%BB%99ng-tr%E1%BB%ABu-t%C6%B0%E1%BB%A3ng.mp4?s=mp4-640x640-is&k=20&c=EtiPqCTKqisjTxOD3srqWbHGaJ007oa0n4bcFIb7b7c=" />
      </div>
    </div>

    )   
    };


