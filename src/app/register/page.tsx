'use client';
import './register.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email === '' || password === '' || confirmPassword === '') {
            alert('Please fill in all fields');
            return;
          }
          if (!email.includes('@')) {
            alert('Please enter a valid email address');
            return;
          }
          if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
          }
          if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
          }
      
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            alert('Registration successful');
            router.push('/login');
          } catch (error) {
            alert('Registration failed. Please try again.');
          }
        };
    return (
        <div className="register-wrapper">
        <div className="register-left">
          <form className="register-form" onSubmit={handleRegister}>
            <h2>Create an account</h2>
  
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
  
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
  
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
  
            <button type="submit">Register</button>
  
            <div className="login-link">
              Already have an account? <a href="/login">Log in</a>
            </div>
          </form>
        </div>
  
        <div className="register-right">
          <video
            autoPlay
            loop
            muted
            src="https://media.istockphoto.com/id/1363217414/vi/video/m%C3%A0u-x%C3%A1m-tr%E1%BA%AFng-m%E1%BB%8Bn-b%C3%B3ng-g%E1%BB%A3n-s%C3%B3ng-n%E1%BB%81n-chuy%E1%BB%83n-%C4%91%E1%BB%99ng-tr%E1%BB%ABu-t%C6%B0%E1%BB%A3ng.mp4?s=mp4-640x640-is&k=20&c=EtiPqCTKqisjTxOD3srqWbHGaJ007oa0n4bcFIb7b7c="
          />
        </div>
      </div>
  
        
    
          
      );
    }