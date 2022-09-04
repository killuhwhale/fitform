import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { useTheme } from 'styled-components'
import { SmallText, RegularText, LargeText, TitleText } from '../Text/Text'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../shared'
import { WorkoutItemProps } from "./types";
import darkBackground from "./../../../assets/bgs/dark_bg.png"
import mockLogo from "./../../../assets/bgs/mock_logo.png"
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Props as WorkoutScreenProps } from "../../app_pages/WorkoutScreen";
const CardBG = styled.ImageBackground`
    height: ${SCREEN_HEIGHT * 0.06}px;
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
    flex: 1;
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
const displayWeights = (weights_list) => {
    let str = '';
    weights_list.forEach(num => str += `${num}, `)
    return str.slice(0, -2)
}
const WorkoutItemRow: FunctionComponent<WorkoutItemProps> = (props) => {
    const theme = useTheme();

    // Workout item is on the WorkoutScreen screen
    // const navigation = useNavigation<WorkoutScreenProps["navigation"]>();
    // const handlePress = () => { navigation.navigate("WorkoutScreen", { ...props }) };
    const handlePress = () => { };
    const { duration, duration_unit, intensity, reps, rounds, rest_duration, rest_duration_unit, sets, weight_unit, weights, name } = props
    const weights_list: Array<number> = JSON.parse(weights)
    const weightStr = displayWeights(weights_list)
    const weight_units: Set<string> = new Set(["kg", "lb"]);
    const percentage_units: Set<string> = new Set(["%"]);
    const bodyweight_units: Set<string> = new Set(["bw"]);
    const distance_units: Set<string> = new Set(["m", "yd", "km", "mi", "ft"]);

    const weightLabel: string =
        weight_units.has(weight_unit) ? "Weights" :
            percentage_units.has(weight_unit) ? "Percentage" :
                distance_units.has(weight_unit) ? "Distance" :
                    bodyweight_units.has(weight_unit) ? "Body weight" :
                        ""
        ;
    console.log("Weights", weightStr)

    return (
        <CardBG source={darkBackground}>
            <CardTouchable underlayColor={theme.palette.transparent} activeOpacity={0.9} onPress={handlePress} >
                <TouchableView>
                    <CardRow>
                        <SmallText textStyles={{ paddingLeft: 4, paddingTop: 8 }} >{name.name} </SmallText>
                        {duration > 0 ?
                            <SmallText textStyles={{ paddingLeft: 4, paddingTop: 8 }} >Duration {duration} {duration_unit}</SmallText>
                            :
                            <></>
                        }
                        {rounds > 0 ?
                            <SmallText textStyles={{ paddingLeft: 4, paddingTop: 8 }} >Rounds {rounds} </SmallText>
                            :
                            <></>
                        }
                        {sets > 0 ?
                            <SmallText textStyles={{ paddingLeft: 4, paddingTop: 8 }} >Sets {sets} </SmallText>
                            :
                            <></>
                        }
                        {reps > 0 ?
                            <SmallText textStyles={{ paddingLeft: 4, paddingTop: 8 }} >Reps {reps} </SmallText>
                            :
                            <></>
                        }
                    </CardRow>
                    <CardRow>
                        {JSON.parse(weights) ?
                            <SmallText textStyles={{ paddingLeft: 4, paddingTop: 8 }} >{weightLabel} {weightStr} {weight_unit}</SmallText>
                            :
                            <></>
                        }
                        {intensity >= 0 ?
                            <SmallText textStyles={{ paddingLeft: 4, paddingTop: 8 }} >Intensity {intensity}</SmallText>
                            :
                            <></>
                        }
                        {rest_duration >= 0 ?
                            <SmallText textStyles={{ paddingLeft: 4, paddingTop: 8 }} >Rest Duration {rest_duration} {rest_duration_unit}</SmallText>
                            :
                            <></>
                        }
                    </CardRow>

                    {/* <CardRow style={{ height: '25%' }}>
                        <CardFooterBG >
                            <CardRow style={{ height: '100%' }}>
                                <View style={{ flex: 3 }}>

                                </View>
                                <LogoImage source={{ uri: 'https://www.nasa.gov/sites/default/files/thumbnails/image/web_first_images_release.png' }} />
                            </CardRow>
                        </CardFooterBG>
                    </CardRow> */}

                </TouchableView>
            </CardTouchable>

        </CardBG >
    );
};

export default WorkoutItemRow;