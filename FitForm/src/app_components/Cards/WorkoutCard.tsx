import React, { FunctionComponent, useState } from "react";
import styled from "styled-components/native";
import { useTheme } from 'styled-components'
import { SmallText, RegularText, LargeText, TitleText } from '../Text/Text'
import { useNavigation } from "@react-navigation/native";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../shared'
import { GymClassCardProps, WorkoutCardProps } from "./types";
import { displayWeights, ItemString } from "../../app_pages/input_pages/gyms/CreateWorkoutScreen";
import { View } from "react-native";
import { Props as GymClassScreenProps } from "../../app_pages/GymClassScreen";
import { AnimatedButton } from "../Buttons/buttons";
import { useDeleteWorkoutMutation } from "../../redux/api/apiSlice";
import { WorkoutItemPreviewHorizontalList } from "./cardList";

const CardBG = styled.ImageBackground`
    resize-mode: cover;
    height: ${SCREEN_HEIGHT * 0.25}px;
    width: ${SCREEN_WIDTH * 0.92}px;
    border-radius: 25px;
    marginBottom: 12px;
    border: 1px;
    border-color: white;
`;


const CardFooterBG = styled.View`
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


//Todo 
// Button for WorkoutName info/ media
// Button to add workout to CompletedWorkouts
// Possbily this will pre-load a new Component/ Model that way we can alter the numbers we used instead....
// Caculate load/ volume of workout.

const WorkoutCard: FunctionComponent<WorkoutCardProps> = (props) => {
    const theme = useTheme();
    const cardWidth = SCREEN_WIDTH * 0.92
    const colWidth = cardWidth * 0.45

    const navigation = useNavigation<GymClassScreenProps["navigation"]>();
    // const handlePress = () => { navigation.navigate("WorkoutScreen", { ...props }) };
    const handlePress = () => { };
    const [deleteWorkout, { isLoading }] = useDeleteWorkoutMutation();
    const numItems = props.workout_items.length - 1
    const itemsPerCol = 1
    const numCols = Math.max(
        1,
        Math.ceil((props.workout_items.length) / itemsPerCol)
    );
    const navToWorkoutDetail = () => {
        navigation.navigate("WorkoutDetailScreen", props)
    }


    return (
        <View style={{
            backgroundColor: theme.palette.gray,
            width: SCREEN_WIDTH * 1.0,
            borderRadius: 25,
            marginBottom: 24,
            paddingBottom: 12,

        }}>
            <View style={{ width: '100%', paddingLeft: 8, paddingTop: 8, flex: 1 }}>
                <WorkoutItemPreviewHorizontalList
                    data={props.workout_items}
                    schemeType={props.scheme_type}
                    itemWidth={colWidth}
                />

            </View>
            <View style={{ borderColor: theme.palette.text, borderWidth: props.editable ? 5 : 0, borderRadius: 25, backgroundColor: theme.palette.transparent, flex: 1 }} >
                <AnimatedButton
                    onFinish={() => props.editable ? deleteWorkout(props.id) : navToWorkoutDetail()}
                    title="del workout"
                    active={props.editable}
                >
                    <CardRow style={{ height: '100%' }}>
                        <View style={{
                            flex: 3, flexDirection: 'row', paddingLeft: 16,
                            alignContent: 'center', alignItems: 'center',
                            justifyContent: 'space-between', paddingRight: 16
                        }}>
                            <RegularText>{props.title}  </RegularText>
                            <RegularText>{displayWeights(props.scheme_rounds)}</RegularText>
                        </View>
                    </CardRow>
                </AnimatedButton>
            </View>
        </View >
    );
};

export default WorkoutCard;