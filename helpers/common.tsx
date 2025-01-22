/*
    Author: Amay Kataria
    Date: 01/21/2025
    Name: common.js
    Description: Common helper functions that are used across the application.
*/

import { Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

// Helper function to convert percentage to height
export const hp = (percentage) => {
    return (percentage * height) / 100;
}

// Helper function to convert percentage to width
export const wp = (percentage) => {
    return (percentage * width) / 100;
}