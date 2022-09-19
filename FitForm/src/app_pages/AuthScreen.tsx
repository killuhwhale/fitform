import React, { FunctionComponent, useState } from "react";
import styled from "styled-components/native";
import { Container } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
import { Stack, Button, TextInput, IconButton } from "@react-native-material/core";
import Icon from 'react-native-vector-icons/Ionicons';


// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { GymCardList } from '../app_components/Cards/cardList'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { decrement, increment } from '../redux/slicers/slicer'
import { useGetProfileViewQuery } from "../redux/api/apiSlice";
import AuthManager from "../utils/auth";
import * as RootNavigation from '../navigators/RootNavigation'
import { View } from "react-native";


// import { RootStackParamList } from "../navigators/RootStack";
// import { StackScreenProps } from "@react-navigation/stack";
// export type Props = StackScreenProps<RootStackParamList, "AuthScreen">

const PageContainer = styled(Container)`
    
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    
    width: 100%;
    height: 100%;
`;

const AuthContainer = styled.View`
    width: 80%;
    padding-top: 45px;
`;

const AuthScreen: FunctionComponent = () => {
    const theme = useTheme();
    // Access value
    // Access/ send actions
    const auth = AuthManager;
    const [isSignIn, setIsSignIn] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [hidePassword, setHidePassword] = useState(true)
    const [emailHelperText, setEmailHelperText] = useState("")
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

    const login = () => {
        console.log("Send login: ", email, password)
        auth.login(email, password);
    };


    const onEmailChange = (text: string) => {
        // Todo add debounce to allow user to enter last few chars and then check...
        console.log(text)
        if (text.indexOf("@") >= 0 && text.indexOf(".") >= 0) {
            if (!reg.test(text)) {
                setEmailHelperText("Invalid email")
            } else {
                setEmailHelperText("")
            }

        } else if (emailHelperText != "") {
            setEmailHelperText("")
        }
        setEmail(text);
    };

    const onPasswordChange = (text: string) => {
        setPassword(text);
    };



    // RootNavigation.navigate("HomePage", {})
    return (
        <PageContainer>
            <AuthContainer>
                {
                    isSignIn ?
                        <View style={{ height: '100%' }}>

                            <View style={{ flex: 2 }}>
                                <TextInput
                                    style={{ height: 100 }}
                                    onChangeText={onEmailChange.bind(this)}
                                    label="Email"
                                    value={email}
                                    helperText={emailHelperText}
                                    leading={props => <Icon name="person" {...props} />}
                                />
                                <TextInput
                                    style={{ height: 100 }}
                                    label="Password"
                                    value={password}
                                    onChangeText={onPasswordChange.bind(this)}
                                    secureTextEntry={hidePassword}
                                    trailing={props => <Icon name="eye" onPress={() => setHidePassword(!hidePassword)} {...props} />}
                                />
                            </View>

                            <View style={{ flex: 2 }}>
                                <Button onPress={() => { login() }} title="Sign In" />
                            </View>
                        </View>

                        :
                        <>
                            <RegularText>Sign Up</RegularText>
                        </>
                }
            </AuthContainer>
        </PageContainer >
    );
};


export default AuthScreen;