import { StyleSheet, Text, View, ScrollView, Pressable, Alert} from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { wp, hp } from '@/helpers/common'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { getUserImageSrc, uploadFile } from '@/services/imageService'
import { Image } from 'expo-image'
import Icon from '@/assets/icons'
import { theme } from '@/constants/theme'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { updateUser } from '@/services/userService'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

const editProfile = () => {
    const {userData, setUserData} = useAuth()
    const [curUser, setUser] = useState({
        name: '',
        phoneNumber: '',
        image: null,
        bio: '',
        address: ''
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const onSubmit = async () => {
        // Destructure the current object and extract the properties we want to use.
        let { name, phoneNumber, address, image, bio } = curUser

        
        if (!name || !phoneNumber || !address || !bio || !image) {
            Alert.alert('Profile', "Please fill all the fields")
            return
        }
        setLoading(true)

        // User picked an image from the local gallery
        // We'll upload this to Supabase as well. 
        if (typeof image === 'object') {
            // Begin uploading.
            let imageRes = await uploadFile('profiles', image?.uri, true)
            if (imageRes.success) 
                // 
                curUser.image = imageRes.data
            else 
                curUser.image = null
        }

        // API call to update the user
        const res = await updateUser(userData?.id, curUser)
        setLoading(false)

        // Update the user data for the local app, by reconciling it with the previous data. 
        if (res.success) {
            setUserData({...userData, ...curUser});
            router.back();
        }
    }
    const onPickImage = async () => {
        console.log("Helo Image Picker")
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7
        })

        if (!result.canceled) {
            setUser({...curUser, image: result.assets[0]})
        }
    }

    // If an image is picked from the picker, we show that image. Else, we 
    // show the image that is grabbed from the Supabase database.
    let imageSource = curUser.image && typeof curUser.image === 'object' ?
        curUser.image.uri : getUserImageSrc(userData.image)

    // When we read good userData, then we update the current user's values.
    useEffect(() => {
        if (userData) {
            setUser({
                name: userData.name || '',
                phoneNumber: userData.phoneNumber || '',
                image: userData.image || null,
                address: userData.address || '',
                bio: userData.bio || ''
            })
        }
    }, [userData])
    return (
    <ScreenWrapper bg="white">
        <View style={styles.container}>
            <ScrollView style={{flex: 1}}>
                <Header title={"Edit Profile"} />

                {/* form */}
                <View style={styles.form}>
                    <View style={styles.avatarContainer}>
                        <Image source={imageSource} style={styles.avatar} />
                        <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                            <Icon name="camera" size={20} strokeWidth={2.5} />
                        </Pressable>
                    </View>
                    <Text style={{fontSize: hp(1.5), color: theme.colors.text}}>
                        Please fill your profile details
                    </Text>
                    <Input
                        icon={<Icon name="user" />}
                        placeholder="Enter your name"
                        value={curUser.name}
                        onChangeText={value=>setUser({...curUser, name: value})}
                    />
                    <Input
                        icon={<Icon name="call" />}
                        placeholder="Enter your phone number"
                        value={curUser.phoneNumber}
                        onChangeText={value=>setUser({...curUser, phoneNumber: value})}
                    />
                    <Input
                        icon={<Icon name="location" />}
                        placeholder="Enter your address"
                        value={curUser.address}
                        onChangeText={value=>setUser({...curUser, address: value})}
                    />
                    <Input
                        placeholder="Enter your bio"
                        value={curUser.bio}
                        multiline={true}
                        containerStyle={styles.bio}
                        onChangeText={value=>setUser({...curUser, bio: value})}
                    />

                    {/* update button */}
                    <Button title="Update" loading={loading} onPress={onSubmit} />
                </View>
            </ScrollView>
        </View> 
    </ScreenWrapper>
    )
}

export default editProfile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(4)
    },
    form: {
        gap: 10, 
        marginTop: 20
    },
    avatarContainer: {
        width: hp(14),
        height: hp(14),
        alignSelf: 'center'
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: theme.radius.xxl*1.8,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: theme.colors.darkLight
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: -10, 
        padding: 8,
        borderRadius: 50,
        backgroundColor: 'white',
        shadowColor: theme.colors.textLight,
        shadowOffset: { width: 0, height: 4},
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 7
    },
    bio: {
        flexDirection: 'row',
        height: hp(15),
        alignItems: 'flex-start',
        paddingVertical: 15
    }
})