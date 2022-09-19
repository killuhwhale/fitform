import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { Container, DISTANCE_UNITS, DURATION_UNITS, DURATION_W, REPS_W, ROUNDS_W, SCREEN_HEIGHT, SCREEN_WIDTH, STANDARD_W, WORKOUT_TYPES } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { WorkoutGroupCardList, WorkoutItemPreviewHorizontalList, WorkoutStatsByNameHorizontalList, WorkoutStatsByTagHorizontalList } from '../app_components/Cards/cardList'

import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { StyleSheet, View } from "react-native";
import { useGetGymClassDataViewQuery } from "../redux/api/apiSlice";
import { WorkoutCardProps, WorkoutItemListProps, WorkoutItemProps } from "../app_components/Cards/types";
import { displayWeights } from "./input_pages/gyms/CreateWorkoutScreen";
export type Props = StackScreenProps<RootStackParamList, "WorkoutDetailScreen">

const ScreenContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    width: 100%;
`;



/**
 * 
 * @param schemeRounds 
 * @param schemeType 
 * @param items 
 * @returns 
 * 
 * [{name: {primary: "lower"},...}, {},....]
 * 
 * TAGS = {
 *  "lower": {
 *      totalReps: 10,
        totalLbs: 10,
        totalKgs: 10,
 *  },
 * }
 * 
 * 
 */




export interface WorkoutStats {
    totalReps: number;
    totalLbs: number;
    totalKgs: number;
    totalTime: number;
    totalDistanceM: number;
    totalDistanceYd: number;
    key?: string;
}

const defaultStats = {
    totalReps: 0,
    totalLbs: 0,
    totalKgs: 0,
    totalTime: 0,
    totalDistanceM: 0,
    totalDistanceYd: 0,
    key: '',
} as WorkoutStats

const sumWorkoutStats = (a: {}, b: WorkoutStats) => {

    // Adds B to A
    Object.keys(b).forEach(key => {
        // Arms, legs, squat etc.....
        const summaryObj = b[key]
        if (!a[key]) {
            a[key] = { ...defaultStats }
        }

        Object.keys(summaryObj).forEach(sumkey => {
            if (typeof (a[key][sumkey]) == typeof (0) || !a[key][sumkey]) {
                a[key][sumkey] += b[key][sumkey]
            }
        })

    })
}


export const processMultiWorkoutStats = (data: WorkoutCardProps[]): [{}, {}] => {

    const allTags = {}
    const allNames = {}
    if (!data) return [{}, {}]

    data.forEach(workout => {
        const { scheme_rounds, scheme_type, workout_items } = workout
        const [tags, names] = processWorkoutStats(scheme_rounds, scheme_type, workout_items)
        sumWorkoutStats(allTags, tags)
        sumWorkoutStats(allNames, names)
    })

    return [{ ...allTags }, { ...allNames }]
}


const processWorkoutStats =
    (schemeRounds: string, schemeType: number, items: WorkoutItemProps[]): [WorkoutStats, WorkoutStats] => {
        const tags = {} as WorkoutStats
        const names = {} as WorkoutStats
        const defaultStats = {
            totalReps: 0,
            totalLbs: 0,
            totalKgs: 0,
            totalTime: 0,
            totalDistanceM: 0,
            totalDistanceYd: 0,
            key: '',
        } as WorkoutStats

        items.forEach(item => {
            console.log("Process: ", item)
            const weights = item.weights ? JSON.parse(item.weights) : []

            // Tags
            const pCat = item.name.primary?.title
            const sCat = item.name.secondary?.title

            // Title
            const workoutName = item.name.name

            if (!tags[pCat]) {
                tags[pCat] = { ...defaultStats, key: pCat }
            }

            if (!names[workoutName]) {
                names[workoutName] = { ...defaultStats, key: workoutName }
            }



            if (WORKOUT_TYPES[schemeType] == STANDARD_W) {

            } else if (WORKOUT_TYPES[schemeType] == REPS_W) {
                const repsPerRounds = schemeRounds.split(" ")

                repsPerRounds.forEach((reps, idx) => {

                    tags[pCat].totalReps += parseInt(reps) * item.reps;
                    names[workoutName].totalReps += parseInt(reps) * item.reps;

                    if (item.duration) {
                        const val = DURATION_UNITS[item.duration_unit] == 'sec' ?
                            item.duration : item.duration * 60
                        console.log("val: ", val)
                        tags[pCat].totalTime += val
                        names[workoutName].totalTime += val

                    } else if (item.distance) {

                        const val = DISTANCE_UNITS[item.distance_unit] == 'm' ?
                            item.distance
                            : DISTANCE_UNITS[item.distance_unit] == 'km' ?
                                item.distance * 1000
                                : 0

                        tags[pCat].totalDistanceM += val
                        names[workoutName].totalDistanceM += val


                        const valYd = DISTANCE_UNITS[item.distance_unit] == 'yd' ?
                            item.distance
                            : DISTANCE_UNITS[item.distance_unit] == 'mi' ?
                                item.distance * 1760
                                : 0
                        tags[pCat].totalDistanceYd += valYd
                        names[workoutName].totalDistanceYd += valYd

                    }

                    if (item.weight_unit == "lb" && weights.length) {
                        const val = parseInt(reps) * item.reps * weights[idx]
                        tags[pCat].totalLbs += val
                        names[workoutName].totalLbs += val

                    } else if (item.weight_unit == "kg" && weights.length) {
                        const val = parseInt(reps) * item.reps * weights[idx]
                        tags[pCat].totalKgs += val
                        names[workoutName].totalKgs += val

                    } else if (item.weight_unit == "%" && weights.length) {

                    }


                });
            } else if (WORKOUT_TYPES[schemeType] == ROUNDS_W) {

            } else if (WORKOUT_TYPES[schemeType] == DURATION_W) {

            }
        });
        console.log(tags, names)
        return [tags, names]
    }



export const TagPanelItem: FunctionComponent<{ tag: WorkoutStats; }> = ({ tag }) => {
    return (
        <View style={PanelStyle.container}>
            <RegularText>{tag.key}</RegularText>
            {
                tag.totalReps ?
                    <SmallText>Reps: {tag.totalReps}</SmallText>
                    : <></>
            }
            {
                tag.totalDistanceM ?
                    <SmallText>Distance: {tag.totalDistanceM} m </SmallText>
                    : <></>
            }
            {
                tag.totalTime ?
                    <SmallText>Duration: {tag.totalTime} sec</SmallText>
                    : <></>
            }
            {
                tag.totalKgs ?
                    <SmallText>Volume: {tag.totalKgs} kg</SmallText>
                    : <></>
            }
            {
                tag.totalLbs ?
                    <SmallText>Volume: {tag.totalLbs} lb</SmallText>
                    : <></>
            }
        </View>
    )
}


export const NamePanelItem: FunctionComponent<{ name: WorkoutStats; }> = ({ name }) => {
    console.log("Name props", name)
    return (
        <View style={PanelStyle.container}>
            <RegularText>{name.key}</RegularText>
            {
                name.totalReps ?
                    <SmallText>Reps: {name.totalReps}</SmallText>
                    : <></>
            }
            {
                name.totalDistanceM ?
                    <SmallText>Distance: {name.totalDistanceM} m </SmallText>
                    : <></>
            }
            {
                name.totalTime ?
                    <SmallText>Duration: {name.totalTime} sec</SmallText>
                    : <></>
            }
            {
                name.totalKgs ?
                    <SmallText>Volume: {name.totalKgs} kg</SmallText>
                    : <></>
            }
            {
                name.totalLbs ?
                    <SmallText>Volume: {name.totalLbs} lb</SmallText>
                    : <></>
            }




        </View>
    )
}

const PanelStyle = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH / 3,
        flexDirection: "column",

    },
});

export const StatsPanel: FunctionComponent<{ tags: {}; names: {}; }> = ({ tags, names }) => {
    const theme = useTheme()

    return (
        <View style={{ margin: 4 }}>
            <View style={{ alignItems: 'flex-start' }}>
                <View style={{ borderBottomWidth: 1, borderColor: theme.palette.text }}>
                    <RegularText>Tag Summary</RegularText>
                </View>
                <WorkoutStatsByTagHorizontalList
                    data={Object.values(tags)}
                />

            </View>
            <View style={{ alignItems: 'flex-start' }}>
                <View style={{ borderBottomWidth: 1, borderColor: theme.palette.text }}>
                    <RegularText>Item Summary</RegularText>

                </View>
                <WorkoutStatsByNameHorizontalList
                    data={Object.values(names)}
                />

            </View>
        </View>
    )
}




const WorkoutDetailScreen: FunctionComponent<Props> = ({ navigation, route: { params } }) => {
    const theme = useTheme();
    const { id, workout_items, title, desc, date, scheme_rounds, scheme_type, editable, onDelete } = params || {};
    const [tags, names] = processWorkoutStats(scheme_rounds, scheme_type, workout_items)

    return (
        <ScreenContainer >
            <View style={{ width: '100%' }}>
                <View style={{ width: '100%', alignItems: 'flex-end', }}>

                </View>
                <LargeText>{title}</LargeText>
                <RegularText>{desc}</RegularText>
                <SmallText>{date}</SmallText>
                <View style={{ marginTop: 8 }}>
                    <RegularText>{WORKOUT_TYPES[scheme_type]} {displayWeights(scheme_rounds)}</RegularText>

                </View>
                <View style={{ height: 150 }}>
                    <WorkoutItemPreviewHorizontalList
                        data={workout_items}
                        schemeType={scheme_type}
                        itemWidth={200}
                    />

                </View>
                <StatsPanel
                    tags={tags}
                    names={names}
                />


            </View>
        </ScreenContainer>


    );
};



export default WorkoutDetailScreen;

