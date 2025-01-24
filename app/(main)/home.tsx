import { Alert, StyleSheet, Text, View, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Button from '@/components/Button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { theme } from '@/constants/theme'
import { hp, wp } from '@/helpers/common'
import Icon from '@/assets/icons'
import { useRouter } from 'expo-router'
import Avatar from '@/components/Avatar'
import { fetchPosts } from '@/services/postService'

const home = () => {
  const  {userData } = useAuth()
  const router = useRouter()

  const [posts, setPosts] = useState([])

  // Read the posts from Supabase
  const getPosts = async() => {
    let res = await fetchPosts();
    console.log('got post results', res)
    console.log('User:', res.data[0].user)
  }

  useEffect(() => {
    getPosts()
  }, [])

  // This is the final data that the user profile has to show.
  //console.log('User Data:', userData)

  // const onLogout = async () => {
  //   // Logout from the app.
  //   const { error } = await supabase.auth.signOut()
  //   if (error) {
  //     Alert.alert('Log Out', "Error Signing Out")
  //   }
  // }
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.title}>LinkUp</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => router.push('notifications')}>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('newPost')}>
              <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('profile')}>
              <Avatar 
                uri={userData?.image} 
                size={hp(4.3)} 
                style={{borderWidth: 2}} 
                rounded={theme.radius.sm}
              />
            </Pressable>
          </View>
        </View>
      </View>
      {/* <Button title="Log Out" onPress={onLogout} /> */}
    </ScreenWrapper>
  )
}

export default home

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(4)
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
    borderWidth: 3
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4)
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text
  },
  pill: {

  }
})