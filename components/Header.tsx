import { StyleSheet, Text, View, TouchableOpacity, Alert, TouchableWithoutFeedback, Keyboard} from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import BackButton from './BackButton'
import { hp, wp } from '@/helpers/common'
import { theme } from '@/constants/theme'
import Icon from '@/assets/icons'
import { supabase } from '@/lib/supabase'

const Header = ({title, showBackButton=true, showLogoutButton=true, mb=10}) => {
    const router = useRouter()
    const onLogout = async () => {
        // Logout from the app.
        const { error } = await supabase.auth.signOut()
        if (error) {
            Alert.alert('Log Out', "Error Signing Out")
        }
    }
    const handleLogout = async () => {
        Alert.alert('Confirm', 'Are you sure you want to log out?', [
            {
                text: 'Cancel',
                onPress: () => console.log('modal cancelled'),
                style: 'cancel'
            },
            {
                text: 'Logout',
                onPress: onLogout,
                style: 'destructive'
            }
        ])
    }
    return (
        <View style={[styles.container, {marginBottom: mb}]}>
            {
            showBackButton && (
                <View style={styles.backButton}>
                    <BackButton router={router} />
                </View>
            )
            }
            <Text style={styles.title}>{title || ""}</Text>
            {
                showLogoutButton && (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Icon name="logout" color={theme.colors.rose} />
                    </TouchableOpacity>
                )
            }
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        gap: 10
    },
    title: {
        fontSize: hp(2.7),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.textDark
    },
    backButton: {
        position: 'absolute',
        left: 0,
    },
    logoutButton: {
        position: 'absolute',
        right: 0,
        padding: 5,
        borderRadius: theme.radius.sm,
        backgroundColor: '#fee2e2'
    }
})