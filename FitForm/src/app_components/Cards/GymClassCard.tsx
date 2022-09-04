import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { useTheme } from 'styled-components'
import { SmallText, RegularText, LargeText, TitleText } from '../Text/Text'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../shared'
import { GymClassCardProps } from "./types";
import darkBackground from "./../../../assets/bgs/dark_bg.png"
import mockLogo from "./../../../assets/bgs/mock_logo.png"
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Props as GymScreenProps } from "./../../app_pages/GymScreen";
const CardBG = styled.ImageBackground`
    height: ${SCREEN_HEIGHT * 0.25}px;
    width: ${SCREEN_WIDTH * 0.92}px;
    resize-mode: cover;
    border-radius: 25px;
    overflow: hidden;
    marginBottom: 12px;
`;


const CardFooterBG = styled.ImageBackground`
    resize-mode: cover;
    border-radius: 25px;
    background-color: ${props => props.theme.palette.transparent};
    flex:1;
    overflow: hidden;
`;


const CardTouchable = styled.TouchableHighlight`
    height: 100%;
    border-radius: 25px;
`;


const TouchableView = styled.View`
    justify-content: space-between;
    align-items: center;
    flex: 1;    
`;

const CardRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
`;

const MainImage = styled.Image`
    width: 100%;
    height: 80%;
    resize-mode: contain;
`;

const LogoImage = styled.Image`
    width: 100%;
    height: 100%;
    border-radius: 25px;
    flex:1;
`;

const GymClassCard: FunctionComponent<GymClassCardProps> = (props) => {
    const theme = useTheme();

    // Gym class card is on the Gym screen
    const navigation = useNavigation<GymScreenProps["navigation"]>();
    const handlePress = () => { navigation.navigate("GymClassScreen", { ...props }) };

    return (
        <CardBG source={{ uri: 'https://www.nasa.gov/sites/default/files/thumbnails/image/web_first_images_release.png' }}>
            <CardTouchable underlayColor={theme.palette.transparent} activeOpacity={0.9} onPress={handlePress} >
                <TouchableView>
                    <CardRow>

                    </CardRow>
                    <CardRow style={{ height: '25%' }}>
                        <CardFooterBG >
                            <CardRow style={{ height: '100%' }}>
                                <View style={{ flex: 3 }}>
                                    <RegularText textStyles={{ paddingLeft: 16, paddingTop: 8 }} >{props.title}: {props.id}</RegularText>
                                </View>
                                <LogoImage source={{ uri: 'https://www.nasa.gov/sites/default/files/thumbnails/image/web_first_images_release.png' }} />
                            </CardRow>
                        </CardFooterBG>
                    </CardRow>

                </TouchableView>
            </CardTouchable>

        </CardBG >
    );
};

export default GymClassCard;