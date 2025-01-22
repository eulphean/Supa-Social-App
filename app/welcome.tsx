/*
    Author: Amay Kataria
    Date: 01/21/2025
    Name: Welcome.tsx
    Description: Welcome screen for the app.
*/

import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '@/constants/theme'
import React from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { hp, wp } from '@/helpers/common';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
const welcomeImage = require('../assets/images/welcome.png');

const Welcome = () => {
    const router = useRouter();
    return (
        <ScreenWrapper bg={"white"}>
            <View style={styles.container}>
                {/* Welcome Image */}
                <Image 
                    style={styles.welcomeImage} 
                    resizeMode='contain'
                    source={welcomeImage} 
                />

                {/* Title */}
                <View style={{gap: 20}}>
                    <Text style={styles.title}>LinkUp!</Text>
                    <Text style={styles.punchline}>Where every thought finds a home and every image tells a story.</Text>
                </View>

                <View style={styles.footer}>
                    
                    {/* Get Started */}
                    <Button 
                        title="Get Started"
                        buttonStyle={{margingHorizontal: wp(3)}} 
                        onPress={() => router.push('signUp')}
                    />
                    <View style={styles.bottomTextContainer}>
                        <Text style={styles.loginText}>
                            Already have an account!
                        </Text>
                        <Pressable onPress={() => router.push('login')}>
                            <Text style={[styles.loginText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>
                                Login
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default Welcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: "white",
        paddingHorizontal: wp(4) // Helps give a responsive style.
    },
    welcomeImage: {
        height: hp(30),
        width: wp(100),
        alignSelf: 'center'
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(4),
        textAlign: 'center',
        fontWeight: theme.fonts.extraBold
    },
    punchline: {
        textAlign: 'center',
        paddingHorizontal: wp(10),
        fontSize: hp(1.7),
        color: theme.colors.text
    },
    footer: {
        gap: 30,
        width: '100%'
    },
    bottomTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    loginText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.8)
    }
});