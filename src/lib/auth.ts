'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AUTH_COOKIE_NAME = 'tunnelvision_auth';
const HARDCODED_USER = 'admin';
const HARDCODED_PASS = 'password'; // In a real app, use hashed passwords and a database

export async function attemptLogin(prevState: any, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const username = formData.get('username');
  const password = formData.get('password');

  if (typeof username !== 'string' || typeof password !== 'string') {
    return { success: false, error: 'Invalid form data.' };
  }

  // Simulate credential check
  if (username === HARDCODED_USER && password === HARDCODED_PASS) {
    cookies().set(AUTH_COOKIE_NAME, 'authenticated_user_token', { // Store a mock token
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      path: '/', 
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
    });
    return { success: true };
  }
  return { success: false, error: 'Invalid username or password.' };
}

export async function logoutUser(): Promise<void> {
  cookies().delete(AUTH_COOKIE_NAME);
  redirect('/login');
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  return !!cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function protectedRoute(): Promise<void> {
  if (!await isAuthenticated()) {
    redirect('/login');
  }
}
