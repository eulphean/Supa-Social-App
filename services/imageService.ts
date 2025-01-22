import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'
import { supabase } from '@/lib/supabase'
import { supabaseURL } from '@/constants'

export const getUserImageSrc = imagePath => {
    if (imagePath) {
        return getSupabaseUrl(imagePath)
    }
        return require('../assets/images/defaultUser.png')
}

export const getSupabaseUrl = (filePath) => {
    if (filePath) {
        return `${supabaseURL}/storage/v1/object/public/uploads/${filePath}`
    }
    
    return null
}

export const uploadFile = async(folderName, fileUri, isImage=true) => {
    try {
        let fileName = getFilePath(folderName, isImage)
        // Conver this file into base64 data
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64
        })
        // Returns an array buffer. 
        const imageData = decode(fileBase64) 
        let {data, error} = await supabase
            .storage
            .from('uploads') // Bucket name
            .upload(fileName, imageData, {
                cacheControl: '3600',
                upsert: false, // Ensures that it'll create a new file everytime we upload a file
                contentType: isImage? 'image/*' : 'video/*' // Really important to specify this, else we can't upload
            });
            if (error) {
                console.log('File upload error: ', error);
                return { success: false, msg: 'Could not upload media' }
            }

            // data.path is the path how we actually query for the file again in the future.
            // It contains the folder and the file name
            return { success: true, data: data.path }

    } catch (error) {
        console.log('File upload error: ', error);
        return { success: false, msg: 'Could not upload media' }
    }
}

export const getFilePath = (folderName, isImage) => {
    return `/${folderName}/${(new Date()).getTime()}${isImage? '.png' : '.mp4'}`
    // profiles/8943232.png
    // images/824324123.png
}