import { Alert, StyleSheet, Text, View, Pressable, FlatList } from 'react-native'
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
import { fetchPosts, getComment } from '@/services/postService'
import PostCard from '@/components/PostCard'
import Loading from '@/components/Loading'
import { getUserData } from '@/services/userService'

let limit = 0
const home = () => {
  const  {userData } = useAuth()
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
    let res = await fetchPosts(limit);
    if (res.success) {
      if (posts.length === res.data?.length)
          setHasMore(false)
      setPosts(res.data)
    }
  }

  // Callback fired when a new post is created.
  const handlePostEvent = async(payload) => {
    console.log('Post Home Realtime: ', payload)
    if (payload.eventType === 'INSERT' && payload?.new?.id) {
      let newPost = {...payload.new}
      
      // Populate all the data in the new post.
      let res = await getUserData(newPost.userId)
      newPost.user = res.success ? res.data : {}
      newPost.postLikes = []
      newPost.comments = [{count: 0}]
      
      // console.log('New Post Filled: ', newPost)
      // Make sure to put the new post on the top.
      setPosts(prevPosts => [newPost, ...prevPosts])
    }

    // Filter out the deleted posts.
    if (payload.eventType === 'DELETE' && payload?.old?.id) {
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.filter(post => post.id !== payload.old.id)
        return updatedPosts
      })
    }

    // // When post is updated, we get data in the new file.
    if (payload.eventType === 'UPDATE' && payload?.new?.id) {
      setPosts(prevPosts => {
        console.log('Prev Posts: ', prevPosts)
        const updatedPosts = prevPosts.map(post => {
          if (post.id === payload.new.id) {
            post.body = payload.new.body
            post.file = payload.new.file
          }
          return post
        })

        console.log('Updated Posts: ', updatedPosts)
        return updatedPosts
      })
    }
  }

  // console.log('Home Posts: ', posts);

  // Callback fired when a comment is added or removed. 
  const handleCommentUpdate = async (payload) => {
    // // Insertion is handled
    if (payload.eventType === 'INSERT') {
      console.log('Adding comment: ', payload)
      const newComment = {...payload.new}
      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (post.id === newComment.postId) {
            return {
              ...post,
              comments: [{count: post.comments[0].count + 1}]
            }
          }
          return post
        })
      })
    } else if (payload.eventType === 'DELETE') { 
      // NOTE: TODO! Don't know how to handle deleting a comment and updating it in home!
      // Realtime updates only give information about the "CommentID" that has been deleted.
      // We don't know anything about other things.
      const oldComment = {...payload.old}
      console.log('Deleting Comment: ', oldComment)
    }
  }

  // NOTE: State is badly mismanaged between components and that's what's causing these issues
  // where the likes and comments are not synced with each other.
  const handlePostLikesUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {      
      const newLike = {...payload.new}
      console.log('Adding like: ', newLike)
      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (post.id === newLike.postId) {
            return {
              ...post,
              postLikes: [newLike]
            }
          }
          return post
        })
      })
    } else if (payload.eventType === 'DELETE') {
      const oldLike = {...payload.old}
      console.log('Deleting like: ', oldLike)
    }


    // // Go through each post, if the postId === newLike.postId, then increment/decrement postCount
    // const postToUpdate = posts.find(post => posts.id === newLike.postId)
    // console.log('Post to Update', postToUpdate)
    // const newPosts = posts.map(post => {
    //   // Update your post.
    //   if (post.id === newLike.postId) {
    //     if (newLike.eventType === 'INSERT')
    //       post.postLikes.push(newLike)
    //     else if (newComment.eventType === 'DELETE') {
    //       // post.comments[0].count -= 1
    //     }
    //   }
    // })
    // setPosts(newPosts)
  }

  // console.log('Posts in home: ', posts[0])

  useEffect(() => {
    // Listen to real-time updates from the posts table. It's like subscribing to a channel / hook
    // to listen to real-time updates from the database. 
    const postChannel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts'}, handlePostEvent)
      .subscribe()

    // Don't need to call this here to fetch posts.
    // getPosts()

    // Listen to real-time updates from the comments table for every new comment that is created.
    // It's like subscribing to a channel / hook to listen to real-time updates from the database. 
    const commentsChannel = supabase
        .channel('home_comments') // Use a unique name for each channel, else it can cause conflict
        .on('postgres_changes', { 
            event: '*', // NOTE: We only want to get realtime updates for Insert only,.
            schema: 'public', 
            table: 'comments'
        }, handleCommentUpdate)
        .subscribe()
    // Subscribe to the real-time updates from comments table

    // This is broken right now and will need to be fixed.
    // Listen to real-time updates from the comments table for every new comment that is created.
    // It's like subscribing to a channel / hook to listen to real-time updates from the database. 
    const postLikesChannel = supabase
        .channel('home_post_likes') // Use a unique name for each channel, else it can cause conflict
        .on('postgres_changes', { 
            event: '*', // NOTE: We only want to get realtime updates for Insert only,.
            schema: 'public', 
            table: 'postLikes'
        }, handlePostLikesUpdate)
        .subscribe()
    // Subscribe to the real-time updates from postLikes table

    // This callback is automatically called when the component is unmounted.
    return () => {
      supabase.removeChannel(postChannel)
      supabase.removeChannel(commentsChannel)
      supabase.removeChannel(postLikesChannel)
    }
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

        {/* posts */}
        <FlatList
          data={posts}
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
            <View style={{marginVertical: posts?.length === 0 ? 200 : 30}}>
                <Loading />
            </View>
          ) : (
            <View style={{marginVertical: 30}}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )}
        />
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

  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text
  }
})