import { View, Text, StyleSheet, Pressable, Alert } from 'react-native'
import ScreenWrapper from '@/components/ScreenWrapper'
import React, { useState, useRef } from 'react'
import { theme } from '@/constants/theme'
// It'll import the index.tsx file from which we can get the icons.
import Icon from '@/assets/icons'
import { StatusBar } from 'expo-status-bar'
import BackButton from '@/components/BackButton'
import { useRouter } from 'expo-router'
import { hp, wp } from '@/helpers/common'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { supabase } from '@/lib/supabase'

const login = () => {
  const router = useRouter()
  const emailRef = useRef("")
  const passwordRef = useRef("")
  const [loading, setLoading] = useState(false)
  const onSubmit = async () => {
    // Validation for email and password
    if (!emailRef.current || !passwordRef.current) {
        Alert.alert("Login", "Please fill all the fields")
        return
    } 

    const email = emailRef.current.trim();
    const password = passwordRef.current.trim();

    setLoading(true);
    
    const {error} = await supabase.auth.signInWithPassword({
        email,
        password
    });

    setLoading(false)

    // console.log('error', error)
    if (error) {
        Alert.alert('Login', error.message)
    }

    // Good to go to call the API on this. Let's go from here! 
  }
  return (
    <ScreenWrapper bg="white">
        {/* <StatusBar style="dark" /> */}
        <View style={styles.container}>
            <BackButton router={router}/>

            {/* welcome text */}
            <View>
                <Text style={styles.welcomeText}>Hey, </Text>
                <Text style={styles.welcomeText}>Welcome Back </Text>
            </View>

            {/* form */}
         
            <View style={styles.form}>
                <Text style={{fontSize: hp(1.5), color: theme.colors.text}}>
                    Please login to continue
                </Text>
                <Input
                    icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
                    placeholder='Enter your email'
                    onChangeText={value => emailRef.current = value}
                />
                <Input
                    icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                    placeholder='Enter your password'
                    secureTextEntry
                    onChangeText={value => passwordRef.current = value}
                />
                <Text style={styles.forgotPassword}>
                    Forgot password?
                </Text>
                <Button 
                    title="Login"
                    onPress={onSubmit}
                    loading={loading}
                />
            </View>

            {/* footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Don't have an account?
                </Text>
                <Pressable onPress={() => router.push('signUp')}>
                    <Text style={[styles.footerText, {color:theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>Sign Up</Text>
                </Pressable>
            </View>
        </View>
    </ScreenWrapper>
  )
}

export default login

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        gap: 45,
        paddingHorizontal: wp(5)
    },
    welcomeText: {
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text
    },
    form: {
        gap: 25
    },
    forgotPassword: {
        textAlign: 'right',
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6)
    }
})