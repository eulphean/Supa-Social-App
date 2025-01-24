import { ScrollView, StyleSheet, Text, View, Keyboard, 
  TouchableWithoutFeedback, TouchableOpacity, Pressable } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Header from '@/components/Header'
import { theme } from '@/constants/theme'
import { wp, hp } from '@/helpers/common'
import Avatar from '@/components/Avatar'
import { useAuth } from '@/contexts/AuthContext'
import RichTextEditor from '@/components/RichTextEditor'
import { useRouter } from 'expo-router'
import Icon from '@/assets/icons'
import Button from '@/components/Button'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { getSupabaseUrl } from '@/services/imageService'
import { Video } from 'expo-av'
import { createOrUpdatePost } from '@/services/postService'

const newPost = () => {
  const {userData} = useAuth()
  const bodyRef = useRef("")
  const editorRef = useRef(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)

  // Pick an image
  const onPick = async(isImage) => {
    const mediaConfig = {
      mediaTypes: isImage ? ['images']: ['videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7
    }

    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    // Set the image/file that is chosen in the state. 
    if (!result.canceled) {
        setFile(result.assets[0])
    }
  }

  const onSubmit = async() => {
    if (!bodyRef.current && !file) {
      Alert.alert('Post', "Please choose an image or add post body")
    }

    let data = {
      file: file,
      body: bodyRef.current,
      userId: userData?.id
    }

    // Create post
    setLoading(true)
    let res = await createOrUpdatePost(data)
    setLoading(false)
    
    if (res.success) {
      setFile(null)
      bodyRef.current = ''
      // Empty out the editor
      editorRef.current?.setContentHTML('')
      router.back()
    } else {
      Alert.alert('Post', res.msg)
    }
  }

  const getFileType = (file) => {
    if (!file) return null
    if (isLocalFile(file)) {
      // Image picker file will have a property called "type"
      return file.type
    }

    // Check image or video for remote file
    // In supabase, we will store the images in postImage folder and videos in postVideo
    if (file.includes('postImages')) {
      return 'image'
    } 

    return 'video'
  }

  const isLocalFile = (file) => {
    if (!file) return null
    if (typeof file === 'object') return true
    return false
  }

  const getFileUri = file => {
    if (!file) return null
    if (isLocalFile(file)) {
      return file.uri
    }

    // If the file is remote
    return getSupabaseUrl(file)?.uri
  }

  return (
    <ScreenWrapper bg={"white"}>
        <TouchableWithoutFeedback onPress={() => editorRef.current?.blurContentEditor()}>
          <View style={styles.container}>
            <Header title="Create Post" showLogoutButton={false} />
            <ScrollView contentContainerStyle={{gap: 20}}>
                {/* avatar */}
                <View style={styles.header}>
                  <Avatar 
                    uri={userData?.image}
                    size={hp(6.5)}
                    rounded={theme.radius.xl}
                  />
                  <View style={{gap: 2}}>
                    <Text style={styles.username}>
                      {
                        userData && userData.name
                      }
                    </Text>
                    {/* static text */}
                    <Text style={styles.publicText}>
                      Public
                    </Text>
                  </View>
                </View>

                {/* Rich text editor */}
                <View style={styles.textEditor}>
                  <RichTextEditor editorRef={editorRef} onChange={body => bodyRef.current = body}/>
                </View>
                
                {/* image */}
                {
                  file && (
                    <View style={styles.file}>
                        {
                          getFileType(file) === 'video' ? (
                            <Video 
                              style={{flex: 1}} 
                              source={{uri: getFileUri(file)}} 
                              useNativeControls
                              isLooping
                            />
                          ) : (
                            <Image source={getFileUri(file)} resizeMode='cover' style={{flex: 1}} />
                          )
                        }
                        <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                          <Icon name="delete" size={20} color={"white"} />
                        </Pressable>
                    </View>
                  )
                }
                {/* media  */}
                <View style={styles.media}>
                    <Text style={styles.addImageText}>Add to your post</Text>
                    <View style={styles.mediaIcons}>
                      <TouchableOpacity onPress={() => onPick(true)}>
                        <Icon name="image" size={30} color={theme.colors.dark} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onPick(false)}>
                        <Icon name="video" size={33} color={theme.colors.dark} />
                      </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <Button
              buttonStyle={{height: hp(6.2)}}
              title="Post"
              loading={loading}
              hasShadow={false}
              onPress={onSubmit}
            />
          </View>
          </TouchableWithoutFeedback>
    </ScreenWrapper>
  )
}

export default newPost

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30, 
    paddingHorizontal: wp(4),
    gap: 15
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight
  },
  media: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray
  },
  mediaIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  file: {
    height: hp(50),
    width: '100%',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderCurve: 'continuous'
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 0, 0, 0.6)'
  }
})