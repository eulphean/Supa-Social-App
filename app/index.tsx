/*
    Author: Amay Kataria
    Date: 01/21/2025
    Name: Index.tsx
    Description: The entry point for the React-Native application.
*/

import { View, Text, Button } from 'react-native';
import React from 'react';
import Loading from '@/components/Loading';

const index = () => {      
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Loading />
        </View>
    );
}

export default index