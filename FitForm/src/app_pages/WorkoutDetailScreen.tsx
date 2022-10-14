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
import { displayJList, jList } from "./input_pages/gyms/CreateWorkoutScreen";
export type Props = StackScreenProps<RootStackParamList, "WorkoutDetailScreen">

const ScreenContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    width: 100%;
`;
const KG2LB = 2.20462
const LB2KG = 0.453592

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
    // Total duration seconds
    totalTime: number;
    totalKgSec: number;
    totalLbSec: number;

    // Total Distance Meters
    totalDistanceM: number;
    totalKgM: number;
    totalLbM: number;
    key?: string;
}

const defaultStats = {

    totalReps: 0,
    totalLbs: 0,
    totalKgs: 0,

    // Total duration seconds
    totalTime: 0,
    totalKgSec: 0,
    totalLbSec: 0,

    // Total Distance Meters
    totalDistanceM: 0,
    totalKgM: 0,
    totalLbM: 0,
    key: '',
} as WorkoutStats

const sumWorkoutStats = (a: {}, b: {}) => {

    // Adds B to A
    Object.keys(b).forEach(key => {
        // Arms, legs, squat etc.....
        const summaryObj = b[key] as WorkoutStats
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
        const { scheme_rounds, scheme_type, workout_items, completed_workout_items } = workout as WorkoutCardProps
        const [tags, names] = processWorkoutStats(scheme_rounds, scheme_type, workout_items ? workout_items : completed_workout_items ? completed_workout_items : [])
        sumWorkoutStats(allTags, tags)
        sumWorkoutStats(allNames, names)
    })

    return [{ ...allTags }, { ...allNames }]
}


export const parseNumList = (reps): number[] => {
    // A string is representing a single number or a list of space delimited numbers.
    // Works for reps and weights, now we will support "[1,2,3]"
    const result = JSON.parse(jList(reps))
    return result.length > 0 ? result : [0]

    // const str = reps.trim().replaceAll(",", ' ').replaceAll("[", '').replaceAll("]", '')
    // let result: number[] = [0];
    // if (str.indexOf(" ") > 0) {
    //     // We have a list of number
    //     result = str.split(" ").map(strnum => parseInt(strnum))
    // } else if (str.length == 1) {
    //     // We have a single number
    //     result = [parseInt(str)] // str
    // }

    // // console.log("ParseNumList: ", str, result, str.indexOf(" "))
    // return result
}


const dotProd = (a: number[], b: number[]): number => {
    if (!a.length || !b.length || !(a.length === b.length)) {
        return 0
    }
    const A = [...a]
    b.forEach((n, i) => {
        A[i] *= b[i]
    })

    return A.reduce((p, c) => p + c, 0)
}

const expandArray = (arr, len) => {
    // If arr is length 1, we will expand the arr to length: len and fill with value: arr[0] else we willl fill with 0 .
    return arr.length < 2 ? Array.from({ length: len }, (v, i) => arr.length == 1 ? arr[0] : 0) : arr;
}

const processWorkoutStats =
    (schemeRounds: string, schemeType: number, items: WorkoutItemProps[]): [{}, {}] => {
        const tags = {}
        const names = {}

        items.forEach(item => {
            // console.log("Process: ", item)


            // Tags
            const pCat = item.name.primary?.title
            const sCat = item.name.secondary?.title

            // Title
            const workoutName = item.name.name
            if (!tags[pCat]) {
                tags[pCat] = { ...defaultStats, key: pCat } as WorkoutStats
            }
            if (!names[workoutName]) {
                names[workoutName] = { ...defaultStats, key: workoutName } as WorkoutStats
            }





            if (WORKOUT_TYPES[schemeType] == STANDARD_W) {
                const weights = JSON.parse(item.weights)
                // Expand a single value arrray
                const itemWeights = expandArray(weights, item.sets);
                const itemReps = JSON.parse(item.reps)
                const itemDuration = JSON.parse(item.duration)
                const itemDistance = JSON.parse(item.distance)


                // Quantity is single, weights are mutlitple
                const quantity = itemReps[0] ?
                    itemReps[0]
                    : itemDuration[0] ?
                        itemDuration[0]
                        : itemDistance[0] ?
                            itemDistance[0]
                            : 0

                const totalVol = quantity * (weights.length == 0 ? 0 : itemWeights.reduce((p, c) => p + c, 0))

                if (itemReps.length) {
                    //Reps
                    tags[pCat].totalReps += item.sets * quantity
                    names[workoutName].totalReps += item.sets * quantity
                    // Convert weights based on native item weight unit
                    if (item.weight_unit == 'kg') {
                        tags[pCat].totalLbs += totalVol * KG2LB
                        names[workoutName].totalLbs += totalVol * KG2LB

                        tags[pCat].totalKgs += totalVol
                        names[workoutName].totalKgs += totalVol
                    } else {
                        tags[pCat].totalLbs += totalVol
                        names[workoutName].totalLbs += totalVol

                        tags[pCat].totalKgs += totalVol * LB2KG
                        names[workoutName].totalKgs += totalVol * LB2KG
                    }

                } else if (itemDuration) {
                    // Duration
                    tags[pCat].totalTime += quantity * item.sets
                    names[workoutName].totalTime += quantity * item.sets
                    if (item.weight_unit == 'kg') {
                        tags[pCat].totalKgSec += totalVol
                        names[workoutName].totalKgSec += totalVol

                        tags[pCat].totalLbSec += totalVol * KG2LB
                        names[workoutName].totalLbSec += totalVol * KG2LB

                    } else {
                        tags[pCat].totalKgSec += totalVol * LB2KG
                        names[workoutName].totalKgSec += totalVol * LB2KG

                        tags[pCat].totalLbSec += totalVol
                        names[workoutName].totalLbSec += totalVol

                    }

                } else if (itemDistance) {
                    // Distance
                    tags[pCat].totalDistanceM += quantity * item.sets
                    names[workoutName].totalReps += quantity * item.sets

                    if (item.weight_unit == 'kg') {
                        tags[pCat].totalKgM += totalVol
                        names[workoutName].totalKgM += totalVol

                        tags[pCat].totalLbM += totalVol * KG2LB
                        names[workoutName].totalLbM += totalVol * KG2LB

                    } else {
                        tags[pCat].totalKgM += totalVol * LB2KG
                        names[workoutName].totalKgM += totalVol * LB2KG

                        tags[pCat].totalLbM += totalVol
                        names[workoutName].totalLbM += totalVol

                    }
                }
            }
            else if (WORKOUT_TYPES[schemeType] == REPS_W) {
                const repsPerRounds = parseNumList(schemeRounds) // Comes from previous screen, param, string
                const itemReps = JSON.parse(item.reps)
                const itemDuration = JSON.parse(item.duration)
                const itemDistance = JSON.parse(item.distance)
                const weights = JSON.parse(item.weights) // Comes from API, JSON string list
                const itemWeights = expandArray(weights, repsPerRounds.length);

                const quantity = itemReps[0] ?
                    itemReps[0]
                    : itemDuration[0] ?
                        itemDuration[0]
                        : itemDistance[0] ?
                            itemDistance[0]
                            : 0

                repsPerRounds.forEach((roundReps, idx) => {

                    const totalVol = roundReps * quantity * itemWeights[idx]


                    // Reps
                    if (itemReps[0]) {
                        //Reps
                        tags[pCat].totalReps += roundReps * itemReps[0]
                        names[workoutName].totalReps += roundReps * itemReps[0]

                        // Convert weights based on native item weight unit
                        if (item.weight_unit == 'kg') {
                            tags[pCat].totalLbs += totalVol * KG2LB
                            names[workoutName].totalLbs += totalVol * KG2LB

                            tags[pCat].totalKgs += totalVol
                            names[workoutName].totalKgs += totalVol
                        } else {
                            tags[pCat].totalLbs += totalVol
                            names[workoutName].totalLbs += totalVol

                            tags[pCat].totalKgs += totalVol * LB2KG
                            names[workoutName].totalKgs += totalVol * LB2KG
                        }

                    } else if (itemDuration[0]) {
                        // Duration
                        // TODO decide if doing a 30 sec plank should count for a single exercise or if it
                        // Should be 21 reps of 30 sec plank.....
                        // Then we could write 21 15 9  => 3 sec plank ==> 63 sec + 45 sec + 27 sec === 135 sec
                        // ORRR   21 15 9  => 30 sec plank ==> 30 sec + 30 sec + 30 sec === 90 sec
                        // Make duration count just like reps, duration * repRounds = 3 sec * 21 ....
                        tags[pCat].totalTime += itemDuration[0] * roundReps
                        names[workoutName].totalTime += itemDuration[0] * roundReps
                        if (item.weight_unit == 'kg') {
                            tags[pCat].totalKgSec += totalVol
                            names[workoutName].totalKgSec += totalVol

                            tags[pCat].totalLbSec += totalVol * KG2LB
                            names[workoutName].totalLbSec += totalVol * KG2LB

                        } else {
                            tags[pCat].totalKgSec += totalVol * LB2KG
                            names[workoutName].totalKgSec += totalVol * LB2KG

                            tags[pCat].totalLbSec += totalVol
                            names[workoutName].totalLbSec += totalVol

                        }

                    } else if (itemDistance[0]) {
                        // Distance
                        tags[pCat].totalDistanceM += itemDistance[0] * roundReps
                        names[workoutName].totalReps += itemDistance[0] * roundReps
                        if (item.weight_unit == 'kg') {
                            tags[pCat].totalKgM += totalVol
                            names[workoutName].totalKgM += totalVol

                            tags[pCat].totalLbM += totalVol * KG2LB
                            names[workoutName].totalLbM += totalVol * KG2LB

                        } else {
                            tags[pCat].totalKgM += totalVol * LB2KG
                            names[workoutName].totalKgM += totalVol * LB2KG

                            tags[pCat].totalLbM += totalVol
                            names[workoutName].totalLbM += totalVol

                        }
                    }

                });
            }
            else if (WORKOUT_TYPES[schemeType] == ROUNDS_W) {
                const rounds = parseInt(schemeRounds)

                const itemReps = expandArray(JSON.parse(item.reps), rounds)
                const itemDuration = expandArray(JSON.parse(item.duration), rounds)
                const itemDistance = expandArray(JSON.parse(item.distance), rounds)
                const weights = expandArray(JSON.parse(item.weights), rounds)

                const quantity = itemReps[0] ?
                    itemReps[0]
                    : itemDuration[0] ?
                        itemDuration[0]
                        : itemDistance[0] ?
                            itemDistance[0]
                            : 0

                // Reps
                if (itemReps[0]) {
                    //Reps
                    const totalVol = dotProd(itemReps, weights)
                    // console.log("Dot Product: ", quantity, weights, totalVol)

                    tags[pCat].totalReps += itemReps.reduce((p, c) => p + c, 0)
                    names[workoutName].totalReps += itemReps.reduce((p, c) => p + c, 0)


                    // Convert weights based on native item weight unit
                    if (item.weight_unit == 'kg') {
                        tags[pCat].totalLbs += totalVol * KG2LB
                        names[workoutName].totalLbs += totalVol * KG2LB

                        tags[pCat].totalKgs += totalVol
                        names[workoutName].totalKgs += totalVol
                    } else {
                        tags[pCat].totalLbs += totalVol
                        names[workoutName].totalLbs += totalVol

                        tags[pCat].totalKgs += totalVol * LB2KG
                        names[workoutName].totalKgs += totalVol * LB2KG
                    }

                } else if (itemDuration[0]) {

                    const totalVol = dotProd(itemDuration, weights)
                    tags[pCat].totalTime += itemDuration.reduce((p, c) => p + c, 0)
                    names[workoutName].totalTime += itemDuration.reduce((p, c) => p + c, 0)

                    if (item.weight_unit == 'kg') {
                        tags[pCat].totalKgSec += totalVol
                        names[workoutName].totalKgSec += totalVol

                        tags[pCat].totalLbSec += totalVol * KG2LB
                        names[workoutName].totalLbSec += totalVol * KG2LB

                    } else {
                        tags[pCat].totalKgSec += totalVol * LB2KG
                        names[workoutName].totalKgSec += totalVol * LB2KG

                        tags[pCat].totalLbSec += totalVol
                        names[workoutName].totalLbSec += totalVol

                    }

                } else if (itemDistance[0]) {
                    const totalVol = dotProd(itemDistance, weights)
                    tags[pCat].totalDistanceM += itemDistance.reduce((p, c) => p + c, 0)
                    names[workoutName].totalDistanceM += itemDistance.reduce((p, c) => p + c, 0)


                    if (item.weight_unit == 'kg') {
                        tags[pCat].totalKgM += totalVol
                        names[workoutName].totalKgM += totalVol

                        tags[pCat].totalLbM += totalVol * KG2LB
                        names[workoutName].totalLbM += totalVol * KG2LB

                    } else {
                        tags[pCat].totalKgM += totalVol * LB2KG
                        names[workoutName].totalKgM += totalVol * LB2KG

                        tags[pCat].totalLbM += totalVol
                        names[workoutName].totalLbM += totalVol

                    }
                }
            }
            else if (WORKOUT_TYPES[schemeType] == DURATION_W) {
                // Problem is, we dont know how much was accomplished until after the fact.
                // WE can calculate what a single round would be, then once we save this as completed, we can calculate the toatls....
                // For now, we will calc a single round only. 

                const itemReps = expandArray(JSON.parse(item.reps), 1)
                const itemDuration = expandArray(JSON.parse(item.duration), 1)
                const itemDistance = expandArray(JSON.parse(item.distance), 1)
                const weights = expandArray(JSON.parse(item.weights), 1)

                const quantity = itemReps[0] ?
                    itemReps[0]
                    : itemDuration[0] ?
                        itemDuration[0]
                        : itemDistance[0] ?
                            itemDistance[0]
                            : 0

                // Reps
                if (itemReps[0]) {
                    //Reps
                    const totalVol = dotProd(itemReps, weights)
                    // console.log("Dot Product: ", quantity, weights, totalVol)

                    tags[pCat].totalReps += itemReps.reduce((p, c) => p + c, 0)
                    names[workoutName].totalReps += itemReps.reduce((p, c) => p + c, 0)


                    // Convert weights based on native item weight unit
                    if (item.weight_unit == 'kg') {
                        tags[pCat].totalLbs += totalVol * KG2LB
                        names[workoutName].totalLbs += totalVol * KG2LB

                        tags[pCat].totalKgs += totalVol
                        names[workoutName].totalKgs += totalVol
                    } else {
                        tags[pCat].totalLbs += totalVol
                        names[workoutName].totalLbs += totalVol

                        tags[pCat].totalKgs += totalVol * LB2KG
                        names[workoutName].totalKgs += totalVol * LB2KG
                    }

                } else if (itemDuration[0]) {

                    const totalVol = dotProd(itemDuration, weights)
                    tags[pCat].totalTime += itemDuration.reduce((p, c) => p + c, 0)
                    names[workoutName].totalTime += itemDuration.reduce((p, c) => p + c, 0)

                    if (item.weight_unit == 'kg') {
                        tags[pCat].totalKgSec += totalVol
                        names[workoutName].totalKgSec += totalVol

                        tags[pCat].totalLbSec += totalVol * KG2LB
                        names[workoutName].totalLbSec += totalVol * KG2LB

                    } else {
                        tags[pCat].totalKgSec += totalVol * LB2KG
                        names[workoutName].totalKgSec += totalVol * LB2KG

                        tags[pCat].totalLbSec += totalVol
                        names[workoutName].totalLbSec += totalVol

                    }

                } else if (itemDistance[0]) {
                    const totalVol = dotProd(itemDistance, weights)
                    tags[pCat].totalDistanceM += itemDistance.reduce((p, c) => p + c, 0)
                    names[workoutName].totalDistanceM += itemDistance.reduce((p, c) => p + c, 0)


                    if (item.weight_unit == 'kg') {
                        tags[pCat].totalKgM += totalVol
                        names[workoutName].totalKgM += totalVol

                        tags[pCat].totalLbM += totalVol * KG2LB
                        names[workoutName].totalLbM += totalVol * KG2LB

                    } else {
                        tags[pCat].totalKgM += totalVol * LB2KG
                        names[workoutName].totalKgM += totalVol * LB2KG

                        tags[pCat].totalLbM += totalVol
                        names[workoutName].totalLbM += totalVol

                    }
                }
            }
        });
        // console.log('Done processing: ', tags, names)
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
                tag.totalKgs ?
                    <SmallText>Volume: {tag.totalKgs} kg</SmallText>
                    : <></>
            }
            {
                tag.totalLbs ?
                    <SmallText>Volume: {tag.totalLbs} lb</SmallText>
                    : <></>
            }


            {
                tag.totalTime ?
                    <SmallText>Duration: {tag.totalTime} sec</SmallText>
                    : <></>
            }
            {
                tag.totalKgSec ?
                    <SmallText>Volume: {tag.totalKgSec} kg secs</SmallText>
                    : <></>
            }
            {
                tag.totalLbSec ?
                    <SmallText>Volume: {tag.totalLbSec} lb secs</SmallText>
                    : <></>
            }




            {
                tag.totalDistanceM ?
                    <SmallText>Distance: {tag.totalDistanceM} m </SmallText>
                    : <></>
            }
            {
                tag.totalKgM ?
                    <SmallText>Volume: {tag.totalKgM} kg Meters</SmallText>
                    : <></>
            }
            {
                tag.totalLbM ?
                    <SmallText>Volume: {tag.totalLbM} lb Meters</SmallText>
                    : <></>
            }
        </View>
    )
}

/** 
 *  totalReps: 0,
    totalLbs: 0,
    totalKgs: 0,

    // Total duration seconds
    totalTime: 0,
    totalKgSec: 0,
    totalLbSec: 0,

    // Total Distance Meters
    totalDistanceM: 0,
    totalKgM: 0,
    totalLbM: 0,
*/
export const NamePanelItem: FunctionComponent<{ name: WorkoutStats; }> = ({ name }) => {
    // console.log("Name props", name)
    return (
        <View style={PanelStyle.container}>
            <RegularText>{name.key}</RegularText>
            {
                name.totalReps ?
                    <SmallText>Reps: {name.totalReps}</SmallText>
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


            {
                name.totalTime ?
                    <SmallText>Duration: {name.totalTime} sec</SmallText>
                    : <></>
            }
            {
                name.totalKgSec ?
                    <SmallText>Volume: {name.totalKgSec} kg secs</SmallText>
                    : <></>
            }
            {
                name.totalLbSec ?
                    <SmallText>Volume: {name.totalLbSec} lb secs</SmallText>
                    : <></>
            }




            {
                name.totalDistanceM ?
                    <SmallText>Distance: {name.totalDistanceM} m </SmallText>
                    : <></>
            }
            {
                name.totalKgM ?
                    <SmallText>Volume: {name.totalKgM} kg Meters</SmallText>
                    : <></>
            }
            {
                name.totalLbM ?
                    <SmallText>Volume: {name.totalLbM} lb Meters</SmallText>
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
    const { id, workout_items, completed_workout_items, title, desc, date, scheme_rounds, scheme_type, editable } = params || {};
    const items = workout_items ? workout_items : completed_workout_items ? completed_workout_items : []
    const [tags, names] = processWorkoutStats(scheme_rounds, scheme_type, items)

    return (
        <ScreenContainer >
            <View style={{ width: '100%' }}>
                <View style={{ width: '100%', alignItems: 'flex-end', }}>

                </View>
                <LargeText>{title}</LargeText>
                <RegularText>{desc}</RegularText>
                <SmallText>{date}</SmallText>
                <View style={{ marginTop: 8 }}>
                    <RegularText>{WORKOUT_TYPES[scheme_type]} {displayJList(scheme_rounds)}</RegularText>

                </View>
                <View style={{ height: 150 }}>
                    <WorkoutItemPreviewHorizontalList
                        data={items}
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

