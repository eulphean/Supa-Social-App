import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { theme } from '@/constants/theme'
import { hp, wp } from '@/helpers/common'

const Input = (props) => {
  return (
    <View style={[styles.container, props.containerStyle && props.containerStyle]}>
      {props.icon && props.icon}
      <TextInput 
        style={{flex: 1}}
        placeholder={props.placeholder}
        ref={props.inputRef && props.inputRef}
        placeholderTextColor={theme.colors.textLight}
        {...props}
      />
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: hp(7.2),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.0,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: 'continuous',
    paddingHorizontal: 18,
    gap: 12
  }
})