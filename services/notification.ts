import { supabase } from "@/lib/supabase"

export const createNotification = async(notification) => {
    try {
        const { data, error } = await supabase 
            .from('notifications')
            .insert(notification)
            .select()
            .single()

        if (error) {
            console.log('Notification error: ', error)
            return { success: false, msg: 'Could not like the post'}
        }

        return {success: true, data: data}

    } catch (error) {
        console.log('Notification error: ', error)
        return { success: false, msg: 'Could not like the post'}
    }
}

// Detailed view of the post (with comments)
export const fetchNotifications = async(receiverId) => {
    try {
       // 
       const {data, error} = await supabase
        .from('notifications')
        // Get the actual comments and the users who made those comments. 
        .select(`
            *, 
            sender: senderId(id, name, image)
        `)
        .eq('receiverId', receiverId)
        .order('created_at', {ascending: false})

        if (error) {
            console.log('Fetch Notifications error: ', error)
            return { success: false, msg: 'Could not fetch notifications'}
        }

        return {success: true, data: data}

    } catch (error) {
        console.log('Fetch Post Details error: ', error)
        return { success: false, msg: 'Could not fetch notifications'}
    }
}
