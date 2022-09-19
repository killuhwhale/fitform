import 'react-native-gesture-handler';
import React, { FunctionComponent, ReactNode, useEffect, useState, type PropsWithChildren } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './src/app_pages/Home';
import RootStack from './src/navigators/RootStack'
import { DefaultTheme, ThemeProvider, useTheme } from "styled-components/native";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { LargeText, RegularText } from './src/app_components/Text/Text';
import { store } from "./src/redux/store"
import { Provider } from 'react-redux'
import { navigationRef } from './src/navigators/RootNavigation';
import Header from "./src/app_components/Header/header";
import { getToken, useGetUserInfoQuery } from "./src/redux/api/apiSlice";
import AuthManager from "./src/utils/auth";
import AuthScreen from './src/app_pages/AuthScreen';
import Uploady from "@rpldy/native-uploady";
import { BASEURL } from './src/utils/constants';


const DarkTheme: DefaultTheme = {
  borderRadius: '8px',
  palette: {
    primary: {
      main: "#01d54b", // Green
      contrastText: "#fff"
    },
    secondary: {
      main: "#2c365a",
      contrastText: "#fff"
    },
    tertiary: {
      main: "#007cff",
      contrastText: "#fff"
    },
    accent: "#fbcd77",
    text: "#fcfcfc",
    backgroundColor: "#000",
    lightGray: '#474747',
    gray: "#2c365a",
    darkGray: '#2d2d2d',
    transparent: '#34353578',
  }

}

const LightTheme: DefaultTheme = {
  borderRadius: '8px',
  palette: {
    primary: {
      main: "#ef835d",
      contrastText: "#fff"
    },
    secondary: {
      main: "#2c365a",
      contrastText: "#fff"
    },
    tertiary: {
      main: "#007cff",
      contrastText: "#fff"
    },
    lightGray: '#474747',
    gray: "#2c365a",
    darkGray: '#2d2d2d',
    accent: "#fbcd77",
    text: "#000",
    backgroundColor: "#fff",
    transparent: '#34353578',
  }
}



// Todo
// Create an auth class to manage the current state of auth.
// Global object, separate file.
// WHen log in => setUser and callback for auth events, for now at least logout.


// In this component we register a function to the AuthManagement,
// This fn will change the state of the variable to not show the app anymore.
// This fn is called by the manager when the user logs out, manager will also clear the data from async storage.



// TODO
// Figure out auth flow, ex,
// When a user opens app, we make a reuest.

// we get the user, logged in
// else we are not logged in

// TODO
// we get an error for expired access tokem => we get new one w/ refresh token and reattempt request
// we get an error for expired refresh token => we are not logged in.

// Google auth would be nice here too...

const ERR_CODE_BAD_AUTH_HEADER = 'bad_authorization_header'
const ERR_CODE_BAD_TOKEN = 'token_not_valid'
const ERR_CODE_INVALID_TOKEN = 'token_not_valid'
const ERR_MESSAGE_INVALID_EXPIRED = 'Token is invalid or expired'

const TOKEN_TYPE_ACCESS = "access";
const TOKEN_TYPE_REFRESH = "refresh";



const Auth: FunctionComponent<{ children: Array<ReactNode> }> = (props) => {
  const auth = AuthManager;



  // This will check if we have a valid token by sending a request to server for user info.
  // This either loads the app or login page.
  const { data, isLoading, isSuccess, isError, error } = useGetUserInfoQuery("");

  const [loggedIn, setLoggedIn] = useState((data?.email || data?.username) ? true : false);
  const [needToRefreshToken, setNeedToRefreshToken] = useState(false);

  console.log("Auth: ", loggedIn, isLoading, data)
  auth.listenLogout(() => {
    console.log("Listen for logout")
    setLoggedIn(false);
  });
  auth.listenLogin(() => {
    console.log("Listne for login")
    setLoggedIn(true);
  });

  if (!loggedIn && (data?.id ?? false) && (data?.email ?? false)) {
    setLoggedIn(true)
  }

  let showError = false;
  if ((data?.code ?? false) && (data?.detail ?? false) && (data?.messages ?? false)) {
    console.log("we have an error code and need to refresh a token/ re-login or there is a real bad token")
    console.log(data)
    const { code, detail, messages } = data;
    const message = messages[0];

    // I want the middleware in ApiSlice to refresh token.
    // Here, if we see a bad token of type: refresh, we will show login page.
    if (message.message !== ERR_MESSAGE_INVALID_EXPIRED) {
      showError = true;
    }
  }

  return (
    <>
      {
        isLoading ?
          <RegularText>Loading...</RegularText>
          : isSuccess ?
            <>
              {
                showError ?
                  <RegularText>Error</RegularText>
                  : loggedIn ?
                    <>
                      {props.children[0]}
                    </>
                    :

                    <>
                      {props.children[1]}
                    </>
              }
            </>

            : isError ?
              <RegularText>Show Login...</RegularText>
              : <></>
      }
    </>
  );
};


const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = useTheme();
  return (
    <Provider store={store}>
      <ThemeProvider theme={isDarkMode ? LightTheme : DarkTheme}>
        <Uploady destination={{ url: `${BASEURL}` }}>
          <SafeAreaView>
            <StatusBar barStyle={isDarkMode ? 'dark-content' : 'light-content'} />
            <Header />

          </SafeAreaView>
          <Auth>
            <RootStack navref={navigationRef} />
            <AuthScreen />
          </Auth>
        </Uploady>
      </ThemeProvider>
    </Provider>

  );
};

export default App;


