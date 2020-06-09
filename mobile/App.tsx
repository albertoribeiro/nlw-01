import React from 'react';
import { StatusBar, View} from 'react-native'
import Routes from  './src/routes';
import { AppLoading } from 'expo'
import { Roboto_400Regular,Roboto_500Medium} from '@expo-google-fonts/roboto'
import { Ubuntu_700Bold,useFonts} from '@expo-google-fonts/ubuntu'

export default function App() {
  const fontLoaded = useFonts({
      Roboto_400Regular,
      Roboto_500Medium,
      Ubuntu_700Bold
  });
  if(!fontLoaded){
      return <AppLoading/>
  }
  return (
    <>
      <StatusBar barStyle="dark-content" ></StatusBar>
      <Routes/> 
    </>
  );
}