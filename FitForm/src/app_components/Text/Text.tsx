import React, { FunctionComponent } from "react";
import { Text } from "react-native";
import styled from "styled-components/native";
import { TextProps } from './types'


const StyledTitleText = styled.Text`
    font-size: 48px;
    color: ${props => props.theme.palette.text};
    text-align: left;
`;

const StyledLargeText = styled.Text`
    font-size: 36px;
    color: ${props => props.theme.palette.text};
    text-align: left;
`;

const StyledRegularText = styled.Text`
    font-size: 24px;
    color: ${props => props.theme.palette.text};
    text-align: left;
`;

const StyledSmallText = styled.Text`
    font-size: 12px;
    color: ${props => props.theme.palette.text};
    text-align: left;
`;



const TitleText: FunctionComponent<TextProps> = (props) => {
    return <StyledTitleText style={props.textStyles}>{props.children}</StyledTitleText>
};

const LargeText: FunctionComponent<TextProps> = (props) => {
    return <StyledLargeText style={props.textStyles}>{props.children}</StyledLargeText>
};


const RegularText: FunctionComponent<TextProps> = (props) => {
    return <StyledRegularText style={props.textStyles}>{props.children}</StyledRegularText>
};


const SmallText: FunctionComponent<TextProps> = (props) => {
    return <StyledSmallText style={props.textStyles}>{props.children}</StyledSmallText>
};

export { TitleText, LargeText, RegularText, SmallText }