import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'expo-router'
import { getUserData } from '@/services/userService'

// We wrap the main layout with the AuthProvider to provide the authentication context to the entire application.
const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  )
}

const MainLayout = () => {
  // The reason why useAuth returns setAuth is because these are the values that we have passed in the AuthContext.
  const { setUserData } = useAuth()
  const router = useRouter();
  const updateUserData = async (userId) => {
    let res = await getUserData(userId)
    if (res.success) {
      setUserData(res.data)
    }
  }
  useEffect(() => {
    // Register this callback when the component mounts to get the user. Then, we save this user
    // in the context, so other components have access to it. 
    supabase.auth.onAuthStateChange((event, session) => {
      // console.log('Session User: ', session?.user?.id)
      if (session) {
        // Fetch all the actual data from the public.users table in supabase.
        updateUserData(session?.user?.id)
        router.replace('/home')
      } else {
        setUserData(null)
        router.replace('/welcome')
      }
    })
  }, [])
  

  return (
    <Stack screenOptions={{headerShown: false}} />
  )
}

export default _layout