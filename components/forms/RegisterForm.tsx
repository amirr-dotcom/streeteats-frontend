'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { saveToken, saveUser } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  console.log('🟢 RegisterForm component loaded');
  
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'vendor',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    console.log('🔵 FORM SUBMITTED - onSubmit function called');
    console.log('Raw form data:', data);
    
    try {
      setError('');
      setLoading(true);

      // Ensure role is always included (default to 'vendor')
      const signupData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role || 'vendor',
      };

      console.log('📝 ==================== REGISTRATION REQUEST ====================');
      console.log('📝 Registering user data:', JSON.stringify(signupData, null, 2));
      console.log('📝 API Base URL:', api.defaults.baseURL);
      console.log('📝 Full API URL will be:', api.defaults.baseURL + '/auth/signup');
      console.log('📝 ==============================================================');

      // Use the signup endpoint
      console.log('📤 Making API request to:', api.defaults.baseURL + '/auth/signup');
      const response = await api.post('/auth/signup', signupData, {
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });
      console.log('📥 ==================== REGISTRATION RESPONSE ====================');
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));
      console.log('📥 ===============================================================');

      // Check for successful response
      if (response.status === 200 || response.status === 201) {
        if (response.data.success) {
          // Automatically login after registration
          console.log('Attempting to login after successful registration...');
          try {
            const loginResponse = await api.post('/auth/login', {
              email: signupData.email,
              password: signupData.password,
            });

            if (loginResponse.data.success) {
              const { token, user } = loginResponse.data.data;
              saveToken(token);
              saveUser(user);
              login(token, user);
              router.push('/dashboard');
            } else {
              console.error('Login after registration failed:', loginResponse.data);
              setError('Registration successful, but auto-login failed. Please login manually.');
            }
          } catch (loginErr: any) {
            console.error('Login error after registration:', loginErr);
            setError('Registration successful! Please login with your credentials.');
          }
        } else {
          // Response received but success is false
          const errorMsg = response.data.error?.message || response.data.message || 'Registration failed';
          setError(errorMsg);
        }
      } else {
        // Non-2xx status code
        const errorMsg = response.data?.error?.message || response.data?.message || `Registration failed with status ${response.status}`;
        setError(errorMsg);
      }
    } catch (err: any) {
      // Enhanced console logging for debugging
      console.error('❌ ==================== REGISTRATION ERROR ====================');
      console.error('❌ Full Error Object:', err);
      console.error('❌ Error Code:', err.code);
      console.error('❌ Error Message:', err.message);
      console.error('❌ Request URL:', err.config?.url);
      console.error('❌ Request Method:', err.config?.method);
      console.error('❌ Request Data:', err.config?.data);
      console.error('❌ Response Status:', err.response?.status);
      console.error('❌ Response Status Text:', err.response?.statusText);
      console.error('❌ Response Headers:', err.response?.headers);
      console.error('❌ Response Data:', JSON.stringify(err.response?.data, null, 2));
      console.error('❌ Response Error Object:', err.response?.data?.error);
      console.error('❌ ===========================================================');
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle different error types
      if (err.response) {
        // Server responded with error
        if (err.response.data?.error?.message) {
          errorMessage = err.response.data.error.message;
        } else if (err.response.data?.error?.details) {
          errorMessage = err.response.data.error.details;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid request data. Please check your input.';
        } else if (err.response.status === 409) {
          errorMessage = 'Email already exists. Please use a different email.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.code === 'ERR_INTERNET_DISCONNECTED') {
        errorMessage = `Cannot connect to server at ${api.defaults.baseURL}. Please check if the backend is running.`;
      } else if (err.code === 'ERR_CORS' || err.message?.includes('CORS') || err.message?.includes('cors')) {
        errorMessage = 'CORS Error: Backend is not allowing requests from this origin. Please configure CORS on the backend.';
      } else if (err.code === 'ERR_BAD_REQUEST') {
        errorMessage = 'Bad request. Please check your input data.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('❌ Final Error Message Shown to User:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Sign up to start managing your food shop
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

