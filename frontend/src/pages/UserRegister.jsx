import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api.js';   

const UserRegister = () => {

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

            const name = e.target.name.value;
            const username = e.target.username.value;
            const email = e.target.email.value;
            const password = e.target.password.value;
            const profilePhoto = e.target.profilePhoto.files?.[0];

            const formData = new FormData();
            formData.append('name', name);
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);

            if (profilePhoto) {
                formData.append('profilePhoto', profilePhoto);
            }

            const response = await api.post("auth/user/register", formData,
            {
                withCredentials: true
            })

        setAuthToken(response?.data?.token);

        console.log(response.data);

        navigate("/homepage")

    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[radial-gradient(circle_at_30%_20%,theme(colors.gray.100)_0%,theme(colors.white)_60%)] dark:bg-[radial-gradient(circle_at_70%_60%,theme(colors.gray.800)_0%,theme(colors.gray.900)_65%)] bg-fixed">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 md:p-6 rounded-lg shadow-md flex flex-col gap-6" role="region" aria-labelledby="user-register-title">
                <header className="text-center">
                    <h1 id="user-register-title" className="text-2xl font-semibold tracking-wide mb-2">Create your account</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Join to explore and enjoy delicious meals.</p>
                </header>
                <nav className="text-center text-sm text-gray-500 dark:text-gray-400 -mt-1 mb-2">
                    <strong className="font-semibold">Switch:</strong> <Link className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" to="/user/register">User</Link> • <Link className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" to="/food-partner/register">Food partner</Link>
                </nav>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="name" className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Full name</label>
                        <input id="name" name="name" placeholder="Jane Doe" autoComplete="name" className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-md outline-none text-gray-900 dark:text-gray-100 transition-colors focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 w-full min-w-0" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="username" className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Username</label>
                        <input id="username" name="username" placeholder="janedoe" autoComplete="username" className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-md outline-none text-gray-900 dark:text-gray-100 transition-colors focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 w-full min-w-0" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Email</label>
                        <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-md outline-none text-gray-900 dark:text-gray-100 transition-colors focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 w-full min-w-0" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Password</label>
                        <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-md outline-none text-gray-900 dark:text-gray-100 transition-colors focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 w-full min-w-0" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="profilePhoto" className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Profile Photo (Optional)</label>
                        <input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-md outline-none text-gray-900 dark:text-gray-100 transition-colors focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 w-full min-w-0" />
                    </div>
                    <button className="mt-2 bg-blue-600 hover:bg-blue-700 active:translate-y-px focus-visible:outline-2 focus-visible:outline-blue-700 focus-visible:outline-offset-2 text-white font-semibold px-4 py-3 rounded-md transition-all flex items-center justify-center gap-1 shadow-sm" type="submit">Sign Up</button>
                </form>
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account? <Link className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" to="/user/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default UserRegister;