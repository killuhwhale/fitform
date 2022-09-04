import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { useTheme } from 'styled-components'
import { SmallText, RegularText, LargeText, TitleText } from '../Text/Text'
import { useNavigation } from "@react-navigation/native";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../shared'
import { WorkoutGroupCardProps } from "./types";
import darkBackground from "./../../../assets/bgs/dark_bg.png"
import mockLogo from "./../../../assets/bgs/mock_logo.png"
import { View } from "react-native";
import { Props as GymClassScreenProps } from "../../app_pages/GymClassScreen";

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

const WorkoutGroupCard: FunctionComponent<WorkoutGroupCardProps> = (props) => {
    const theme = useTheme();

    const navigation = useNavigation<GymClassScreenProps["navigation"]>();
    const handlePress = () => { navigation.navigate("WorkoutScreen", { ...props }) };



    return (
        <CardBG source={{ uri: 'https://www.nasa.gov/sites/default/files/thumbnails/image/web_first_images_release.png' }}>
            <CardTouchable underlayColor={theme.palette.transparent} activeOpacity={0.9} onPress={handlePress} >
                <TouchableView>
                    <CardRow>
                        <RegularText>
                            {props.title} - {props.caption}
                        </RegularText>
                    </CardRow>
                    <CardRow style={{ height: '25%' }}>
                        <CardFooterBG >
                            <CardRow style={{ height: '100%' }}>

                                <LogoImage source={{ uri: 'https://www.nasa.gov/sites/default/files/thumbnails/image/web_first_images_release.png' }} />
                            </CardRow>
                        </CardFooterBG>
                    </CardRow>

                </TouchableView>
            </CardTouchable>

        </CardBG >
    );
};

export default WorkoutGroupCard;