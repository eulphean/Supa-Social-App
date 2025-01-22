import { supabase } from '../lib/supabase'

// Get user data for a user with userId.
export const getUserData = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            return { success: false, msg: error?.message}
        }
        return { success: true, data }
    } catch (error) {
        console.log('Error in getUserData: ', error)
        return { success: false, msg: error.message }
    }
}

// Update user data for a user with userId. 
export const updateUser = async (userId, data) => {
    try {
        const { error } = await supabase
            .from('users')
            .update(data)
            .eq('id', userId)
            
        if (error) {
            return { success: false, msg: error?.message}
        }
        return { success: true, data }
    } catch (error) {
        console.log('Error in getUserData: ', error)
        return { success: false, msg: error.message }
    }
}