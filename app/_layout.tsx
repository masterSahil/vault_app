import { Stack } from 'expo-router'
import React from 'react'
import { ToastProvider } from 'react-native-toast-notifications'

export default function _layout() {
  return (
    <ToastProvider
      placement="top"
      duration={2000}
      animationType="slide-in"
      animationDuration={250}
      successColor="green"
      dangerColor="red"
      warningColor="orange"
      normalColor="#333"
    >
      <Stack screenOptions={{ headerShown: false }} />
    </ToastProvider>
  )
}