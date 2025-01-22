import { StyleSheet, Text, View, Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import { useRouter } from 'expo-router'
import { hp, wp } from '@/helpers/common'
import { theme } from '@/constants/theme'
import Icon from '@/assets/icons'
import Avatar from '@/components/Avatar'

const profile = () => {
  const { userData, setUserData } = useAuth()
  const router = useRouter()
  return (
    <ScreenWrapper bg="white">
      <UserHeader userData={userData} router={router} />
    </ScreenWrapper>
  )
}

const UserHeader = ({ userData, router }) => {
  return (
    <View style={{flex: 1, backgroundColor: "white", paddingHorizontal: wp(4)}}>
      <Header title="Profile" mb={30}/>
      <View style={styles.container}>
        <View style={{gap: 15}}>
          <View style={styles.avatarContainer}>
            <Avatar 
              uri={userData?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            <Pressable style={styles.editIcon} onPress={() => router.push('editProfile')}>
              <Icon name="edit" strokeWidth={2.5} size={20} />
            </Pressable>
          </View>

          {/* username and address */}
          <View style={{alignItems: 'center', gap: 4}}>
            <Text style={styles.userName}>{userData && userData.name}</Text>
            <Text style={styles.infoText}>{userData && userData.address}</Text>
          </View>

          {/* user email, phone and bio */}
          <View style={{gap:20}}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{userData && userData.email}</Text>
            </View>
            {
              userData && userData.phoneNumber && (
                <View style={styles.info}>
                  <Icon name="call" size={20} color={theme.colors.textLight} />
                  <Text style={styles.infoText}>{userData && userData.phoneNumber}</Text>
                </View>
              )
            }
            {
              userData && userData.bio && (
                <Text style={styles.infoText}>{userData.bio}</Text>
              )
            }
          </View>
        </View>
      </View>
    </View>
  )
}

export default profile

const styles = StyleSheet.create({
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center'
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50, 
    backgroundColor: "white", 
    // shadow styles (since background is white)
    shadowColor: theme.colors.textLight,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4, 
    shadowRadius: 5,
    elevation: 7
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  }, 
  infoText: {
    fontSize: hp(2.0),
    fontWeight: theme.fonts.semibond,
    color: theme.colors.textLight
  }
})