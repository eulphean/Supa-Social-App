import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { fetchPostDetails, createComment, removeComment } from '@/services/postService'
import { wp, hp } from '@/helpers/common'
import { theme } from '@/constants/theme'
import PostCard from '@/components/PostCard'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'expo-router'
import Loading from '@/components/Loading'
import Input from '@/components/Input'
import Icon from '@/assets/icons'
import CommentItem from '@/components/CommentItem'
import { supabase } from '@/lib/supabase'
import { getUserData } from '@/services/userService'

const postDetails = () => {
    // Extract the post id from the route.
    const {postId} = useLocalSearchParams()
    const {userData} = useAuth()

    const [post, setPost] = useState(null)
    const router = useRouter()
    // We use this when the postCard is actually loading up. Until it's loaded, we 
    // want to show an Activity Loader
    const [startLoading, setStartLoading] = useState(true)

    // This loading state is when a comment is created.
    const [loading, setLoading] = useState(false)

    const inputRef = useRef(null)
    const commentRef = useRef('')
    const onNewComment  = async() => {
        if (!commentRef.current) return null

        let data = {
            userId: userData?.id,
            postId: post?.id,
            text: commentRef.current
        }

        // Create comment in supabase
        setLoading(true)
        let res = await createComment(data)
        setLoading(false)
        if (res.success) {
            // console.log('New Comment: ', res.data)
            // Send notification later
            inputRef?.current?.clear()
            commentRef.current = ''
        } else {
            Alert.alert('Comment', res.msg)
        }
    }

    const onDeleteComment = async(comment) => {
        let res = await removeComment(comment?.id)
        if (res.success) {
            // Filter out the current comment from this post (it's the one that we just deleted)
            setPost(prevPost => {
                let updatedPost = {...prevPost}
                // This removes the comment that has been deleted. 
                updatedPost.comments = updatedPost.comments.filter(c => c.id !== comment.id)
                return updatedPost
            })
        } else {
            Alert.alert('Comment', res.msg)
        }
    }

    // console.log('Post Details: ', post)
    const handleNewComment = async(payload) => {
        // console.log('Got new comment', payload)
        let newComment = {...payload.new}
        // Get user data for that comment
        let res = await getUserData(newComment.userId)
        newComment.user = res.success ? res.data : {}
        setPost(prevPost => {
            return {
                ...prevPost,
                comments: [newComment, ...prevPost.comments]
            }
        })
    }

    useEffect(() => {
        // Listen to real-time updates from the comments table for a "specific post with postId." 
        // It's like subscribing to a channel / hook to listen to real-time updates from the database. 
        const commentsChannel = supabase
            .channel('post_details_comments') // Use a unique name for each channel, else it can cause conflict
            .on('postgres_changes', { 
                event: 'INSERT', // NOTE: We only want to get realtime updates for Insert only,.
                schema: 'public', 
                table: 'comments',
                filter: `postId=eq.${postId}` // Only get the updates for this post.
            }, handleNewComment)
            .subscribe()
        // Subscribe to the real-time updates from comments table

        // Fetch the post details as soon as the modal is loaded.
        getPostDetails()

        // This callback is automatically called when the component is unmounted.
        return () => {
            supabase.removeChannel(commentsChannel)
        }
    }, [])

    const getPostDetails = async() => {
        // fetch post details here. 
        let res = await fetchPostDetails(postId)
        if (res.success) {
            setPost(res.data)
        }
        setStartLoading(false)
    }

    // Show a loader until the post is loaded completely. 
    if (startLoading) {
        return (
            <View style={styles.center}>
                <Loading />
            </View>
        )
    }

    if (!post) {
        return (
            <View style={[styles.center,  {justifyContent: 'flex-start', marginTop: 50}]}>
                <Text style={styles.notFound}>Post not found!</Text>
            </View>
        )
    }

    return (
    <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            <PostCard 
                // We want to add comments length to post object, since we are using that in PostCard to
                // show the length of the comments.
                item={{...post, comments: [{count: post?.comments?.length}]}}
                currentUser={userData}
                router={router}
                hasShadow={false}
                // hide icons that we don't need
                showMoreIcon={false} 
            />

            {/* comment input */}
            <View style={styles.inputContainer}>
                <Input 
                    inputRef={inputRef}
                    placeholder="Type comment"
                    onChangeText={value=>commentRef.current = value}
                    placeholderTextColor={theme.colors.textLight}
                    containerStyle={{flex: 1, height: hp(6.2), borderRadius: theme.radius.xl}}
                />

                {
                    loading ? (
                        <View style={styles.loading}>
                            <Loading size='small' />
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                            <Icon name="send" color={theme.colors.primaryDark} />
                        </TouchableOpacity>
                    )
                }

            </View>

            {/* comment list */}
            <View style={{marginVertical: 15, gap: 17}}>
                {
                    post?.comments?.map(comment =>
                        <CommentItem
                            key={comment?.id?.toString()}
                            item={comment}
                            onDelete={onDeleteComment}
                            // Has this user created this comment or this post? 
                            canDelete={userData.id === comment.userId || userData.id === post.userId}
                        />
                    )
                }

                {
                    post?.comments?.length === 0 && (
                        <Text style={{color: theme.colors.text, marginLeft: 5}}>
                            Be first to comment! 
                        </Text>
                    )
                }
            </View>
        </ScrollView>
    </View>
    )
}

export default postDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: wp(7)
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    list: {
        paddingHorizontal: wp(4)
    },
    sendIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        height: hp(5.8),
        width: hp(5.8)
    },
    center: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center'
    },
    notFound: {
        fontSize: hp(2.5),
        color: theme.colors.text,
        fontWeight: theme.fonts.medium
    },
    loading: {
        height: hp(5.8),
        width: hp(5.8),
        justifyContent: 'center',
        alignItems: 'center',
        tarnsform: [{scale: 1.3}]
    }
})