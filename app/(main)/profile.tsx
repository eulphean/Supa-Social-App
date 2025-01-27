import { StyleSheet, Text, View, Pressable, FlatList } from 'react-native'
import React, {useState} from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import { useRouter } from 'expo-router'
import { hp, wp } from '@/helpers/common'
import { theme } from '@/constants/theme'
import Icon from '@/assets/icons'
import Avatar from '@/components/Avatar'
import { fetchPosts } from '@/services/postService'
import PostCard from '@/components/PostCard'
import Loading from '@/components/Loading'

let limit = 0
const profile = () => {
  const { userData, setUserData } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [hasMore, setHasMore] = useState(true)

  // Read the posts from Supabase
  const getPosts = async() => {
    if (!hasMore) return null
    // A hard limit for the number of posts we want to fetch from the db.
    // When we scroll down, we want to call this method again, to fetch more posts.
    limit = limit + 10

    console.log('Fetching posts: ', limit)
    let res = await fetchPosts(limit, userData.id);
    if (res.success) {
      if (posts.length === res.data?.length)
          setHasMore(false)
      setPosts(res.data)
    }
  }
  

  return (
    <ScreenWrapper bg="white">
       {/* posts */}
       <FlatList
        data={posts}
        // Pass the header
        ListHeaderComponent={<UserHeader userData={userData} router={router} noPadding={true} />}
        ListHeaderComponentStyle={{marginBottom: 30}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={item => item?.id.toString()}
        renderItem={({item}) => 
          <PostCard
            item={item}
            currentUser={userData}
            router={router}
          />
        }
        // have we reached the end?
        onEndReached={() => {
          getPosts()
        }}
        onEndReachedThreshold={0}
        ListFooterComponent={hasMore ? (
          <View style={{marginVertical: posts?.length === 0 ? 100 : 30}}>
              <Loading />
          </View>
        ) : (
          <View style={{marginVertical: 30}}>
            <Text style={styles.noPosts}>No more posts</Text>
          </View>
        )}
      />
    </ScreenWrapper>
  )
}

const UserHeader = ({ userData, router, noPadding=false }) => {
  return (
    <View style={{flex: 1, backgroundColor: "white", paddingHorizontal: noPadding? wp(0) : wp(4)}}>
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
  },
  listStyle: {
    // paddingTop: 20,
    paddingHorizontal: wp(4)
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text
  }
})