import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { theme } from '@/constants/theme'
import { wp, hp } from '@/helpers/common'
import Avatar from './Avatar'
import moment, { updateLocale } from 'moment'
import Icon from '@/assets/icons'
import RenderHtml from 'react-native-render-html'
import { Image } from 'expo-image'
import { getSupabaseUrl } from '@/services/imageService'
import { Video } from 'expo-av'
import { createPostLike, removePostLike } from '@/services/postService'

const textStyle = {
    color: theme.colors.dark,
    fontSize: hp(1.75)
}

// These are specific styles that we use to render specific html tags like div, p, etc.
// This text is coming from the Rich text editor, which we are rendering back to the screen.
const tagsStyles = {
    div: textStyle,
    p: textStyle,
    old: textStyle,
    h1: {
        color: theme.colors.dark
    },
    h4: {
        color: theme.colors.dark
    }
}

const PostCard = ({
    item, 
    currentUser,
    router,
    hasShadow=true
}) => {
  const shadowStyles = {
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1
  }

  const createdAt = moment(item?.created_at).format('MMM D');

  const onLike = async() => {
    if (liked) {
        // Get all the likes for the current post, which doesn't have the like by current user.
        // That'll be the new likes for the post. 
        const updatedLikes = likes.filter(like=>like.userId !== currentUser?.id);
        // Update the likes. 
        setLikes(updatedLikes)

        // Remove the like from the server
        let res = await removePostLike(item?.id, currentUser?.id);
    
        if (!res.success) {
            Alert.alert('Post', 'Something went wrong')
        }
    } else {
        // create new like
        let data = {
            userId: currentUser?.id,
            postId: item?.id,
        }
    
        // Update all the likes first. 
        setLikes([...likes, data])
        let res = await createPostLike(data);
    
        if (!res.success) {
            Alert.alert('Post', 'Something went wrong')
        }
    }
  }

  const openPostDetails = () => {

  }

  const [likes, setLikes] = useState([])
  // Has the current user liked by the current user?
  const liked = likes.filter(like => like.userId === currentUser?.id)[0] ? true : false
  useEffect(() => {
    setLikes(item?.postLikes)
  }, []);

  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        {/* user info and post time */}
        <View style={styles.userInfo}>
            <Avatar
                size={hp(5.5)}
                uri={item?.user?.image}
                rounded={theme.radius.md}
            />
            <View style={{gap: 2}}>
                <Text style={styles.username}>{item?.user?.name}</Text>
                <Text style={styles.postTime}>{createdAt}</Text>
            </View>
        </View>

        <TouchableOpacity onPress={openPostDetails}>
            <Icon name="threeDotsHorizontal" size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* post body and media */}
      <View style={styles.content}>
        <View style={styles.postBody}>
            {
                item?.body && (
                    <RenderHtml
                        contentWidth={wp(100)}
                        source={{html: item?.body}}
                        tagsStyles={tagsStyles}
                    />
                )
            }
        </View>

        {/* post image */}
        {
            // Each file includes a postImages or postVideos
            item?.file && item?.file?.includes('postImages') && (
                <Image
                    source={getSupabaseUrl(item?.file)}
                    transition={100}
                    style={styles.postMedia}
                    contentFit='cover'
                />
            )
        }
      </View>

      {/* post video */}
      {
        item?.file && item?.file?.includes('postVideos') && (
            <Video
                style={[styles.postMedia, {height: hp(30)}]}
                source={{uri: getSupabaseUrl(item?.file)}}
                useNativeControls
                resizeMode={'cover'}
                isLooping
            />
        )
      }

      {/* like, comment, & share */}
      <View style={styles.footer}>
        <View style={styles.footerButton}>
            <TouchableOpacity onPress={onLike}>
                <Icon 
                    name="heart" 
                    size={24} 
                    fill={liked ? theme.colors.rose : 'transparent'} 
                    color={liked ? theme.colors.rose : theme.colors.textLight} 
                />
            </TouchableOpacity>
            <Text style={styles.count}>
                {
                    likes?.length
                }
            </Text>
        </View>

        {/* footer */}
        <View style={styles.footerButton}>
            <TouchableOpacity>
                <Icon name="comment" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
            <Text style={styles.count}>
                {
                    0
                }
            </Text>
        </View>
        <View style={styles.footerButton}>
            <TouchableOpacity>
                <Icon name="share" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default PostCard

const styles = StyleSheet.create({
    container: {
        gap: 10,
        marginBottom: 15, 
        borderRadius: theme.radius.xxl*1.1,
        borderCurve: 'continuous',
        padding: 10,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderWidth: 0.5, 
        borderColor: theme.colors.gray,
        shadowColor: '#000'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    username: {
        fontSize: hp(2.0),
        color: theme.colors.textDark,
        fontWeight: theme.fonts.medium
    },
    postTime: {
        fontSize: hp(1.7),
        color: theme.colors.textLight,
        fontWeight: theme.fonts.medium
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    content: {
        gap: 10
    },
    postBody: {
        marginLeft: 5
    },
    postMedia: {
        height: hp(40),
        width: '100%',
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous'
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    footerButton: {
        marginLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    count: {
        color: theme.colors.text,
        fontSize: hp(1.8)
    }
})