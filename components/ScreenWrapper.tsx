/*
    Author: Amay Kataria
    Date: 01/21/2025
    Name: ScreenWrapper.tsx
    Description: This component wraps the entire screen area. It is used to provide a consistent padding across all screens.
*/

import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const ScreenWrapper = ({children, bg}) => {
    const { top } = useSafeAreaInsets();
    const pTop = top > 0 ? top: 30
    const style = {paddingTop: pTop, backgroundColor: bg}
    return (
        <View style={[styles.container, style]}>
            <StatusBar style="dark" />
            {children}
        </View>
    )
}

export default ScreenWrapper

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})