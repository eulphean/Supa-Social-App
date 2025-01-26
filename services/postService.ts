import { supabase } from "@/lib/supabase"
import { uploadFile } from "./imageService"

export const createOrUpdatePost = async(post) => {
    try {
        // Upload a file
        // Check if this is a local file that we have picked from the local file server.
        if (post.file && typeof post.file === 'object') {
            let isImage = post?.file?.type === 'image'
            let folderName = isImage ? 'postImages' : 'postVideos'
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage)
            if (fileResult.success) 
                // This will be the file path that is created once the file is uploaded. 
                // We will use this path when we are actually making a post on the server.
                post.file = fileResult.data
            else 
                // This 
                return fileResult
        }

        // Upsert is a combined the operation of Update and Insert
        const { data, error } = await supabase
            .from('posts')
            .upsert(post)
            .select()
            .single()

        if (error) {
            console.log('createPost error: ', error);
            return {success: false, msg: 'Could not create your post'}
        }
        
        return {success: true, data: data}

    } catch (error) {
        console.log('Create Post error: ', error)
        return { success: false, msg: 'Could not create your post'}
    }
}

export const fetchPosts = async(limit=10) => {
    try {
       // 
       const {data, error} = await supabase
        .from('posts')
        .select(`
            *, 
            user: users(id, name, image),
            postLikes (*),
            comments (count)
        `)
        .order('created_at', { ascending: false})
        .limit(limit)

        if (error) {
            console.log('Fetch Post error: ', error)
            return { success: false, msg: 'Could not fetch the posts'}
        }

        return {success: true, data: data}

    } catch (error) {
        console.log('Fetch Post error: ', error)
        return { success: false, msg: 'Could not fetch the posts'}
    }
}

export const createPostLike = async(postLike) => {
    try {
        const { data, error } = await supabase 
            .from('postLikes')
            .insert(postLike)
            .select()
            .single()

        if (error) {
            console.log('Post like error: ', error)
            return { success: false, msg: 'Could not like the post'}
        }

        return {success: true, data: data}

    } catch (error) {
        console.log('Post like error: ', error)
        return { success: false, msg: 'Could not like the post'}
    }
}

export const removePostLike = async(postId, userId) => {
    try {
        const { error } = await supabase 
            .from('postLikes')
            .delete()
            .eq('userId', userId)
            .eq('postId', postId)

        if (error) {
            console.log('Post like error: ', error)
            return { success: false, msg: 'Could not remove the post like'}
        }

        return {success: true}

    } catch (error) {
        console.log('Post like error: ', error)
        return { success: false, msg: 'Could not remove the post like'}
    }
}

// Detailed view of the post (with comments)
export const fetchPostDetails = async(postId) => {
    try {
       // 
       const {data, error} = await supabase
        .from('posts')
        // Get the actual comments and the users who made those comments. 
        .select(`
            *, 
            user: users(id, name, image),
            postLikes (*),
            comments (*, user: users(id, name, image))
        `)
        .eq('id', postId)
        .order('created_at', {ascending: false, foreignTable: 'comments'})
        .single()

        if (error) {
            console.log('Fetch Post Details error: ', error)
            return { success: false, msg: 'Could not fetch the posts'}
        }

        return {success: true, data: data}

    } catch (error) {
        console.log('Fetch Post Details error: ', error)
        return { success: false, msg: 'Could not fetch the posts'}
    }
}

// Create a new comment
export const createComment = async(comment) => {
    try {
        const { data, error } = await supabase 
            .from('comments')
            .insert(comment)
            .select()
            .single()

        if (error) {
            console.log('Comment error: ', error)
            return { success: false, msg: 'Could not create your comment'}
        }

        return {success: true, data: data}

    } catch (error) {
        console.log('Comment error: ', error)
        return { success: false, msg: 'Could not create your comment'}
    }
}

export const removeComment = async(commentId) => {
    try {
        const { error } = await supabase 
            .from('comments')
            .delete()
            .eq('id', commentId)

        if (error) {
            console.log('Remove Comment error: ', error)
            return { success: false, msg: 'Could not remove the comment'}
        }

        // We want to return the comment id.
        return {success: true, date: commentId}
    } catch (error) {
        console.log('Remove Comment error: ', error)
        return { success: false, msg: 'Could not remove the comment'}
    }
}
