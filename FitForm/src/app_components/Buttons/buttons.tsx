import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { GestureResponderEvent, StyleProp, TextStyle, ViewStyle } from "react-native";

import { RegularText } from "../Text/Text";


const ButtonView = styled.TouchableOpacity`
    align-items: center;
    background-color: ${props => props.theme.palette.primary.main};
    width: 100%;
    padding: 20px;
    border-radius: 20px;
`;

interface ButtonProps {
    btnStyles?: StyleProp<ViewStyle>;
    onPress: ((event: GestureResponderEvent) => void) | undefined;
    textStyles?: StyleProp<TextStyle>;
    children: React.ReactNode;
}

const RegularButton: FunctionComponent<ButtonProps> = (props) => {
    return <>
        <ButtonView onPress={props.onPress} style={props.btnStyles}>
            <RegularText textStyles={props.textStyles} >{props.children}</RegularText>
        </ButtonView>
    </>;
};

export { RegularButton, };