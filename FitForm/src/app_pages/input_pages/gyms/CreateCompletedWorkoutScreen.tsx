import React, { FunctionComponent, useState, useContext, useCallback } from "react";
import styled from "styled-components/native";
import { ScrollView } from "react-native-gesture-handler";
import { Image, Modal, StyleSheet, View } from "react-native";
import { Container, DURATION_W, REPS_W, ROUNDS_W, SCREEN_HEIGHT, SCREEN_WIDTH, STANDARD_W, WORKOUT_TYPES } from "../../../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../../../app_components/Text/Text'
import { AppBar, Button, IconButton, TextInput } from "@react-native-material/core";
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';

import DocumentPicker from "react-native-document-picker";

import { useTheme } from 'styled-components'
import { useAppSelector, useAppDispatch } from '../../../redux/hooks'
import { useCreateCompletedWorkoutMutation, useCreateGymMutation } from "../../../redux/api/apiSlice";

import { RootStackParamList } from "../../../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import AuthManager from "../../../utils/auth";
import { BASEURL } from "../../../utils/constants";
import { MediaPicker } from "./CreateWorkoutGroupScreen";
import { ImageOrVideo } from "react-native-image-crop-picker";
import { MediaSlider } from "../../../app_components/MediaSlider/MediaSlider";
import { WorkoutCardProps, WorkoutGroupProps, WorkoutItemProps } from "../../../app_components/Cards/types";
import { displayJList, ItemString, jList, nanOrNah, NumberInput, numberInputStyle, numFilter, numFilterWithSpaces, verifyWorkoutItem } from "./CreateWorkoutScreen";
import DatePicker from "react-native-date-picker";
import { ActionCancelModal } from "../../Profile";
import { dateFormat } from "../../StatsScreen";
export type Props = StackScreenProps<RootStackParamList, "CreateCompletedWorkoutScreen">

const PageContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    width: 100%;
`;



// Convert a JSON stringified list to a space demilimited string

const jListToNumStr = (jsonListStr) => {
    const list = JSON.parse(jsonListStr)
    return list.toString().replaceAll(",", " ")
}


const EditWorkoutItem: FunctionComponent<{
    workoutItem: WorkoutItemProps, schemeType: number;
    editItem(workoutIdx: number, itemIdx: number, key: string, value: string | number);
    itemIdx: number;
    workoutIdx: number;
}> = (props) => {

    const { workoutItem, schemeType } = props
    const { sets, reps, duration, distance, weights } = workoutItem

    const [newWeights, setNewWeights] = useState(jListToNumStr(weights));  // Json string list of numbers.
    const [newSets, setNewSets] = useState(jListToNumStr(sets)); // Need this for Standard workouts.
    const [newReps, setNewReps] = useState(jListToNumStr(reps));
    const [newDuration, setNewDuration] = useState(jListToNumStr(duration));
    const [newDistance, setNewDistance] = useState(jListToNumStr(distance));

    const [weightsError, setWeightsError] = useState("")
    const [setsError, setSetsError] = useState("")
    const [repsError, setRepsError] = useState("")
    const [durationError, setDurationError] = useState("")
    const [distanceError, setDistanceError] = useState("")

    return (
        <View style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                <RegularText> edit: {workoutItem.name.name}  </RegularText>

                <ItemString
                    item={workoutItem}
                    schemeType={schemeType}
                />

            </View>


            {
                JSON.parse(reps)[0] != 0 && props.schemeType !== 0 ?
                    <NumberInput
                        containerStyle={numberInputStyle.containerStyle}
                        label="Reps"
                        value={newReps}
                        isError={repsError.length > 0}
                        helperText={repsError}

                        onChangeText={(t: string) => {
                            let val = ""
                            if (WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                                WORKOUT_TYPES[props.schemeType] == REPS_W ||
                                WORKOUT_TYPES[props.schemeType] == DURATION_W
                            ) {
                                val = numFilter(t)
                            } else {
                                val = numFilterWithSpaces(t)
                            }


                            const { success, errorType, errorMsg } = props.editItem(
                                props.workoutIdx,
                                props.itemIdx,
                                'reps',
                                val
                            )
                            if (!success) {
                                setRepsError(errorMsg)
                            } else {
                                setRepsError('')
                            }
                            setNewReps(val)

                        }}
                    />
                    : <></>

            }
            {
                JSON.parse(duration)[0] != 0 && props.schemeType !== 0 ?
                    <NumberInput
                        containerStyle={numberInputStyle.containerStyle}
                        onChangeText={(t) => {
                            let val = ""

                            if (WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                                WORKOUT_TYPES[props.schemeType] == REPS_W ||
                                WORKOUT_TYPES[props.schemeType] == DURATION_W
                            ) {
                                val = numFilter(t)
                            } else {
                                val = numFilterWithSpaces(t)
                            }


                            const { success, errorType, errorMsg } = props.editItem(
                                props.workoutIdx,
                                props.itemIdx,
                                'duration',
                                val
                            )
                            if (!success) {
                                setDurationError(errorMsg)
                            } else {
                                setDurationError('')
                            }
                            setNewDuration(val)
                        }}
                        value={newDuration}
                        label="Duration"
                        isError={durationError.length > 0}
                        helperText={durationError}
                    />
                    : <></>

            }
            {
                JSON.parse(distance)[0] != 0 && props.schemeType !== 0 ?
                    <NumberInput
                        containerStyle={numberInputStyle.containerStyle}
                        label="Distance"
                        value={newDistance}
                        isError={distanceError.length > 0}
                        helperText={distanceError}
                        onChangeText={(t: string) => {
                            let val = "";
                            if (WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                                WORKOUT_TYPES[props.schemeType] == REPS_W ||
                                WORKOUT_TYPES[props.schemeType] == DURATION_W
                            ) {
                                // updateItem('distance', numFilter(t))
                                val = numFilter(t)
                            } else {
                                // updateItem('distance', numFilterWithSpaces(t))
                                val = numFilterWithSpaces(t)
                            }
                            const { success, errorType, errorMsg } = props.editItem(
                                props.workoutIdx,
                                props.itemIdx,
                                'distance',
                                val
                            )

                            if (!success) {
                                setDistanceError(errorMsg)
                            } else {
                                setDistanceError('')
                            }

                            setNewDistance(val)
                        }}
                    />
                    : <></>

            }
            {
                JSON.parse(weights).length != 0 ?
                    <NumberInput
                        containerStyle={[numberInputStyle.containerStyle, { width: '100%' }]}
                        onChangeText={(t) => {
                            let val = "";
                            if (WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                                WORKOUT_TYPES[props.schemeType] == REPS_W ||
                                WORKOUT_TYPES[props.schemeType] == ROUNDS_W
                            ) {
                                val = numFilterWithSpaces(t)
                            } else {
                                val = numFilter(t)
                            }

                            const { success, errorType, errorMsg } = props.editItem(
                                props.workoutIdx,
                                props.itemIdx,
                                'weights',
                                val
                            )

                            if (!success) {
                                setWeightsError(errorMsg)
                            } else {
                                setWeightsError('')
                            }

                            setNewWeights(val)
                        }}
                        isError={weightsError.length > 0}
                        helperText={weightsError}
                        value={newWeights}
                        label="Weight(s)"
                    />
                    : <></>

            }

        </View>
    )
}


const EditWorkout: FunctionComponent<{
    workout: WorkoutCardProps;
    editItem(workoutIdx: number, itemIdx: number, key: string, value: string | number);
    workoutIdx: number;
}> = (props) => {

    const { workout } = props

    return (
        <View style={{ width: '100%', marginTop: 25 }}>
            <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 15 }}>
                <RegularText>Edit {workout.title}</RegularText>
                <RegularText>{displayJList(workout.scheme_rounds)}</RegularText>

            </View>
            <View style={{ width: '100%', paddingLeft: 45 }}>
                {
                    workout.workout_items?.map((item, i) => {
                        return (
                            <EditWorkoutItem
                                key={`edititem_${item.id}`}
                                workoutItem={item}
                                schemeType={workout.scheme_type}
                                editItem={props.editItem}
                                itemIdx={i}
                                workoutIdx={props.workoutIdx}
                            />
                        )
                    })
                }

            </View>

        </View>
    )
}



const CreateCompletedWorkoutScreen: FunctionComponent<Props> = ({ navigation, route: { params } }) => {
    const theme = useTheme();
    // Access/ send actions
    const dispatch = useAppDispatch();

    // todo() put this in state,....
    let initGroup = JSON.parse(JSON.stringify(params)) as WorkoutGroupProps
    const [editedWorkoutGroup, setEditedWorkoutGroup] = useState<WorkoutGroupProps>(initGroup);
    const [showCompleteWorkout, setShowCompleteWorkout] = useState(false);
    const [files, setFiles] = useState<ImageOrVideo[]>();
    const [caption, setCaption] = useState("");
    const [forDate, setForDate] = useState<Date>(new Date());

    const [createCompletedWorkout, { isLoading }] = useCreateCompletedWorkoutMutation();


    const editItem = (workoutIdx, itemIdx, key, value): { success: boolean; errorType: number; errorMsg: string; } => {

        // console.log("Editing item: ", newWorkoutGroup.workouts[workoutIdx].workout_items[itemIdx], value)
        // Before updating the item we need to verify it....
        // Here we just have
        const newWorkoutGroup = { ...editedWorkoutGroup } as WorkoutGroupProps
        if (!newWorkoutGroup.workouts || workoutIdx >= newWorkoutGroup.workouts.length) {
            return { success: false, errorType: 11, errorMsg: 'Workouts not found' }
        }

        const workout = newWorkoutGroup.workouts[workoutIdx]
        if (!workout.workout_items || itemIdx >= workout.workout_items.length) {

            return { success: false, errorType: 10, errorMsg: 'Workout items not found' }
        }

        const item = workout.workout_items[itemIdx]
        item[key] = jList(value)

        const { success, errorType, errorMsg } = verifyWorkoutItem(item, workout.scheme_type, workout.scheme_rounds)


        if (success) {
            console.log("New workout group", newWorkoutGroup)
            setEditedWorkoutGroup({ ...newWorkoutGroup })
        } else {
            console.log("Error editing item for Complete Workout Item", item)
        }


        return { success, errorType, errorMsg }
    }

    const completeWorkout = async () => {
        setShowCompleteWorkout(false)
        console.log("Creating completed workout group!", editedWorkoutGroup)
        if (!editedWorkoutGroup.workouts || editedWorkoutGroup.workouts?.length == 0) {
            console.log("NO workouts, cannot complete.")
            return
        }

        const data = new FormData()

        data.append('title', editedWorkoutGroup.title)
        data.append('caption', caption)
        data.append('for_date', dateFormat(forDate))
        data.append('workouts', JSON.stringify(editedWorkoutGroup.workouts))
        data.append('workout_group', editedWorkoutGroup.id)
        if (files) {
            files.forEach((file) => data.append('files', { uri: file.path, name: file.filename, type: file.mime, }))
        }

        const res = await createCompletedWorkout(data).unwrap()
        console.log("CompltedWG res: ", res)
        if (res.id) {
            navigation.goBack()
        }
    }


    return (
        <PageContainer>
            <View style={{ width: '100%', flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <RegularText textStyles={{ textAlign: 'center' }}>Complete: {params.title}</RegularText>
                </View>

                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <TextInput
                        label="Caption"
                        value={caption}
                        onChangeText={(d) => {
                            setCaption(d)
                        }}
                        style={{ transform: [{ scaleY: 0.9 }] }}
                        leading={props => <Icon name="checkmark-circle-outline" {...props} />}
                    />
                </View>

                <View style={{ flex: 1, flexDirection: 'row', margin: 10, alignItems: 'center', width: '100%' }}>
                    <SmallText textStyles={{ textAlign: 'center', paddingLeft: 16 }}>For: </SmallText>
                    <DatePicker
                        date={forDate}
                        onDateChange={setForDate}
                        mode='date'
                        locale="en"
                        fadeToColor={theme.palette.lightGray}
                        textColor={theme.palette.text}
                        style={{ height: SCREEN_HEIGHT * 0.06, transform: [{ scale: 0.65, }] }}
                    />
                </View>

                <View style={{ flex: 7 }}>

                    <MediaPicker
                        setState={setFiles.bind(this)}
                        title="Select Media"
                    />
                    {
                        files && files.length > 0 ?
                            <MediaSlider
                                data={files}
                            />
                            : <></>
                    }

                </View>

                <View style={{ flex: 8 }}>
                    <RegularText>Edit workouts below</RegularText>
                    <ScrollView>
                        {
                            editedWorkoutGroup.workouts?.map((workout, i) => {
                                return (
                                    <EditWorkout
                                        key={`editworkout_${workout.id}`}
                                        workout={workout}
                                        editItem={editItem}
                                        workoutIdx={i}
                                    />
                                )
                            })
                        }
                    </ScrollView>
                </View>

                <View style={{ flex: 1 }}>

                    <Button title='Complete!' onPress={() => setShowCompleteWorkout(true)} style={{ backgroundColor: theme.palette.lightGray }} />
                </View>
            </View>
            <ActionCancelModal
                actionText="Complete"
                closeText="Close"
                modalText={`Complete workout?`}
                onAction={completeWorkout}
                modalVisible={showCompleteWorkout}
                onRequestClose={() => setShowCompleteWorkout(false)}
            />
        </PageContainer>
    );
}

export default CreateCompletedWorkoutScreen;