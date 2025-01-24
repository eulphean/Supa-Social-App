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

        // Upsert is a combines the operation of Update and Insert
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
       const {data, error} = await supabase
        .from('posts')
        .select(`*, user: users(id, name, image)`)
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