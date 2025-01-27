import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { fetchNotifications } from '@/services/notification'
import { useAuth } from '@/contexts/AuthContext'
import ScreenWrapper from '@/components/ScreenWrapper'
import { wp, hp } from '@/helpers/common'
import { useRouter } from 'expo-router'
import { theme } from '@/constants/theme'
import NotificationItem from '@/components/NotificationItem'
import Header from '@/components/Header'

const notifications = () => {
  const [notifications, setNotifications] = useState([])
  const {userData} = useAuth()
  const router = useRouter();

  const getNotifications = async () => {
    let res = await fetchNotifications(userData.id) 
    if (res.success) 
      setNotifications(res.data)
  }

  useEffect(() => {
    getNotifications();
  }, [])
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title={'Notifications'} showLogoutButton={false} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
        >
         {
          notifications.map(item => {
            return (
              <NotificationItem
                item={item}
                key={item?.id}
                router={router}
              />
            )
          })
         } 
         {
          notifications.length === 0 && (
            <Text style={styles.noData}>No notifications yet</Text>
          )
         }
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

export default notifications

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    paddingHorizontal: wp(4)
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: 'center'
  }
})