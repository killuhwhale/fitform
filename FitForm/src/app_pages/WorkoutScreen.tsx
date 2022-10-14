import React, { FunctionComponent, useState } from "react";
import styled from "styled-components/native";
import { COMPLETED_WORKOUT_MEDIA, Container, MEDIA_CLASSES, SCREEN_HEIGHT, SCREEN_WIDTH, WORKOUT_MEDIA } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { WorkoutCardList } from '../app_components/Cards/cardList'

import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { WorkoutCardProps, WorkoutGroupCardProps, WorkoutGroupProps } from "../app_components/Cards/types";
import { ScrollView } from "react-native-gesture-handler";
import { TouchableWithoutFeedback, View } from "react-native";
import {
    useDeleteCompletedWorkoutGroupMutation, useDeleteWorkoutGroupMutation,
    useFinishWorkoutGroupMutation, useGetCompletedWorkoutByWorkoutIDQuery,
    useGetCompletedWorkoutQuery, useGetUserInfoQuery, useGetWorkoutsForGymClassWorkoutGroupQuery,
    useGetWorkoutsForUsersWorkoutGroupQuery
} from "../redux/api/apiSlice";
import { Button, IconButton, Switch } from "@react-native-material/core";
import Icon from 'react-native-vector-icons/Ionicons';
import { processMultiWorkoutStats, StatsPanel } from "./WorkoutDetailScreen";
import { MediaURLSlider } from "../app_components/MediaSlider/MediaSlider";
import { ActionCancelModal } from "./Profile";
export type Props = StackScreenProps<RootStackParamList, "WorkoutScreen">


const MediaSlider = styled.ImageBackground`
    width: 100%;
    height: 100%;
    resize-mode: cover;
    border-radius: 8px;
    overflow: hidden;
    marginBottom: 12px;
`;

const Row = styled.View`
    flex-direction: row;
    justify-content: space-between;
`;

const WorkoutScreenContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    width: 100%;
`;

const display_rep_scheme = (rounds: Array<number>) => {
    let str = '';
    console.log(rounds)
    rounds.forEach(num => str += `${num}-`)
    return `${str.slice(0, -1)}:`
};


const DisplayWorkout: FunctionComponent<WorkoutCardProps> = (props) => {
    const { title, desc, scheme_type, scheme_rounds, date, workout_items, id } = props;
    const scheme_rounds_list: Array<number> = JSON.parse(scheme_rounds);


    return (
        <View style={{ height: SCREEN_HEIGHT * 0.45 }}>
            <Row style={{ flex: 5 }}>
                <WorkoutInfoSection>
                    <Row style={{ flex: 3 }}>
                        <RegularText>{title}</RegularText>
                    </Row>
                    <Row style={{ flex: 2 }}>
                        <SmallText>{desc}</SmallText>
                    </Row>
                    <Row style={{ flex: 1 }}>
                        {scheme_type === 0 ?
                            <>
                                <SmallText>Standard workout </SmallText>
                            </>
                            : scheme_type === 1 ?
                                <>
                                    <SmallText>Rounds </SmallText>
                                    <SmallText>{scheme_rounds_list[0]} Rounds</SmallText>
                                </>
                                : scheme_type == 2 ?
                                    <>
                                        <SmallText>Rep scheme</SmallText>
                                        <SmallText>{display_rep_scheme(scheme_rounds_list)}</SmallText>
                                    </>
                                    : scheme_type == 3 ?
                                        <>
                                            <SmallText>Time scheme</SmallText>
                                            <SmallText>{scheme_rounds_list[0]}mins of:</SmallText>
                                        </>
                                        : <SmallText>Workout scheme not found</SmallText>
                        }
                    </Row>
                </WorkoutInfoSection>
            </Row>
            <Row style={{ flex: 20 }}>

            </Row>
        </View>
    );
};



/**
 *  TODO() 
 *  - Now we have completed_workout_groups and created_workout_groups (OG)
 *  - We need to ensure that Adding new workouts and deleting workouts
 *          alters the correct Workout and we do not mix up Completed and Created workouts...
 * 
 * 
 * 
 */

const WorkoutScreen: FunctionComponent<Props> = ({ navigation, route: { params } }) => {
    const theme = useTheme();
    const { id, title, caption, owned_by_class, owner_id, media_ids, user_id, completed, workout_group } = params.data || {}; // Workout group
    const { data: userData, isLoading: userIsloading, isSuccess: userIsSuccess, isError: userIsError, error: userError } = useGetUserInfoQuery("");
    let queryResult;

    let mediaClass = -1;
    let isShowingOGWorkoutGroup = true;

    // Data to use for View    
    let oGData = {} as WorkoutGroupProps
    let oGIsLoading = true
    let oGIsSuccess = false
    let oGIsError = false
    let oGError: any = ""

    let completedData = {} as WorkoutGroupProps
    let completedIsLoading = true
    let completedIsSuccess = false
    let completedIsError = false
    let completedError: any = ""

    const [finishWorkoutGroup, isLoading] = useFinishWorkoutGroupMutation()
    console.log("Workout Screen Params: ", params)

    if (owned_by_class == undefined) {
        // WE have a completed workout group
        const { data, isLoading, isSuccess, isError, error } = useGetCompletedWorkoutQuery(id);
        completedData = data
        completedIsLoading = isLoading
        completedIsSuccess = isSuccess
        completedIsError = isError
        completedError = error


        if (workout_group) {
            const { data, isLoading, isSuccess, isError, error } = useGetWorkoutsForGymClassWorkoutGroupQuery(workout_group)
            oGData = data
            oGIsLoading = isLoading
            oGIsSuccess = isSuccess
            oGIsError = isError
            oGError = error
        }

        // Fetch OG Workout by ID

    } else if (owned_by_class) {
        // we have OG workout owneed by class
        const { data, isLoading, isSuccess, isError, error } = useGetWorkoutsForGymClassWorkoutGroupQuery(id);
        oGData = data
        oGIsLoading = isLoading
        oGIsSuccess = isSuccess
        oGIsError = isError
        oGError = error
        if (completed) {
            // Fetch completed group version by ID, we dont know which ID is the completed ID but we can query with user id and OG Workout Group ID
            const { data, isLoading, isSuccess, isError, error } = useGetCompletedWorkoutByWorkoutIDQuery(id);
            completedData = data
            completedIsLoading = isLoading
            completedIsSuccess = isSuccess
            completedIsError = isError
            completedError = error

        }

    } else {
        // we have OG workout owneed by user
        // THis is wrong. This get all users workouts
        // const { data, isLoading, isSuccess, isError, error } = useGetWorkoutsForUsersWorkoutGroupsQuery("");
        // completedData = data
        // completedIsLoading = isLoading
        // completedIsSuccess = isSuccess
        // completedIsError = isError
        // completedError = error
        // isShowingOGWorkoutGroup = false
        const { data, isLoading, isSuccess, isError, error } = useGetWorkoutsForUsersWorkoutGroupQuery(id);
        oGData = data
        oGIsLoading = isLoading
        oGIsSuccess = isSuccess
        oGIsError = isError
        oGError = error
    }


    // Fetch workouts for WorkoutGroup, call depedning on owned_by_class
    const [showingOGWorkoutGroup, setShowingOGWorkoutGroup] = useState(isShowingOGWorkoutGroup);
    const workoutGroup: WorkoutGroupProps = showingOGWorkoutGroup && oGData ? oGData : !showingOGWorkoutGroup && completedData ? completedData : {} as WorkoutGroupProps
    // const isOGWorkoutGroup = workoutGroup.workouts ? true : false
    mediaClass = showingOGWorkoutGroup ? WORKOUT_MEDIA : COMPLETED_WORKOUT_MEDIA

    // console.log("Workout Screen data: ", `showOG? ${showingOGWorkoutGroup}`, oGData, completedData, Object.keys(completedData))

    const [editable, setEditable] = useState(false);
    const [showCreate, setShowCreate] = useState(false);



    const [deleteWorkoutGroupMutation, { isLoading: isDeleteOGWorkoutGroup }] = useDeleteWorkoutGroupMutation()
    const [deleteCompletedWorkoutGroup, { isLoading: isDeleteCompletedWorkoutGroup }] = useDeleteCompletedWorkoutGroupMutation()
    const [deleteWorkoutGroupModalVisible, setDeleteWorkoutGroupModalVisible] = useState(false);
    const [finishWorkoutGroupModalVisible, setFinishWorkoutGroupModalVisible] = useState(false);

    const workouts = workoutGroup.workouts ? workoutGroup.workouts
        : workoutGroup.completed_workouts ? workoutGroup.completed_workouts
            : []

    const [tags, names] = processMultiWorkoutStats(workouts)




    const openCreateWorkoutScreenForStandard = () => {
        navigation.navigate("CreateWorkoutScreen", {
            workoutGroupID: oGData.id.toString(),
            workoutGroupTitle: title,
            schemeType: 0
        })
    }
    const openCreateWorkoutScreenForReps = () => {
        navigation.navigate("CreateWorkoutScreen", {
            workoutGroupID: oGData.id.toString(),
            workoutGroupTitle: title,
            schemeType: 1
        })
    }
    const openCreateWorkoutScreenForRounds = () => {
        navigation.navigate("CreateWorkoutScreen", {
            workoutGroupID: oGData.id.toString(),
            workoutGroupTitle: title,
            schemeType: 2
        })
    }
    const openCreateWorkoutScreenForTime = () => {
        navigation.navigate("CreateWorkoutScreen", {
            workoutGroupID: oGData.id.toString(),
            workoutGroupTitle: title,
            schemeType: 3
        })
    }
    const onConfirmDelete = () => {
        setDeleteWorkoutGroupModalVisible(true)
    }

    const onDelete = async () => {
        if (showingOGWorkoutGroup) {
            console.log("Deleting an OG Workout")
            const deletedWorkoutGroup = await deleteWorkoutGroupMutation(id).unwrap();
        } else {
            console.log("Deleting a completed Workout")
            const deletedWorkoutGroup = await deleteCompletedWorkoutGroup(id).unwrap();

        }
        setDeleteWorkoutGroupModalVisible(false)
    }

    const _finishGroupWorkout = async () => {
        const data = new FormData()
        data.append('group', oGData.id)
        try {
            const res = await finishWorkoutGroup(data)
            console.log("res finsih", res)
            setFinishWorkoutGroupModalVisible(false)
        } catch (err) {
            console.log("Error finishing workout", err)
        }
    }


    const navigateToCompletedWorkoutGroupScreen = () => {
        console.log("Sending data to screen: ", oGData)
        if (oGData && Object.keys(oGData).length > 0) {
            navigation.navigate("CreateCompletedWorkoutScreen", oGData)
        }
    }

    console.log("Current workout Group:", workoutGroup, oGData, completedData, isShowingOGWorkoutGroup, showingOGWorkoutGroup)
    return (
        <WorkoutScreenContainer>


            <Row style={{ flex: 1 }}>

                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center' }}>

                    <View style={{ flex: 1, justifyContent: 'center', width: '100%' }}>
                        {
                            oGIsSuccess && completedIsSuccess ?
                                <View style={{ width: '100%', alignItems: 'center' }}>
                                    <IconButton
                                        style={{ height: 24, }}
                                        icon={
                                            <Icon
                                                name='podium'
                                                color={showingOGWorkoutGroup && !oGIsLoading ? theme.palette.text : 'red'}
                                                style={{ fontSize: 24 }}
                                            />
                                        }
                                        onPress={() => setShowingOGWorkoutGroup(!showingOGWorkoutGroup)}
                                    />
                                    <SmallText textStyles={{ textAlign: 'center' }}>{showingOGWorkoutGroup && !oGIsLoading ? "og" : 'completed'}</SmallText>
                                </View>
                                : <></>
                        }
                    </View>
                    <View style={{ flex: 3 }}>
                        <ScrollView horizontal><RegularText>{workoutGroup.title} ({workoutGroup.id})</RegularText></ScrollView>

                    </View>

                    <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end', flexDirection: 'row', paddingLeft: 12 }}>
                        {
                            showingOGWorkoutGroup && !oGIsLoading && !(userData && userData.id == oGData.owner_id) ?
                                <IconButton
                                    style={{ height: 24, }}
                                    icon={
                                        <Icon
                                            name='rocket'
                                            color={
                                                completedIsSuccess ? theme.palette.primary.main : theme.palette.text
                                            }
                                            style={{ fontSize: 24 }}
                                        />
                                    }
                                    onPress={completedIsSuccess || (userData && userData.id == oGData.owner_id) ? () => { } : navigateToCompletedWorkoutGroupScreen}
                                />
                                :
                                <></>
                        }

                        <IconButton
                            style={{ height: 24, }}
                            icon={<Icon style={{ fontSize: 24 }} name='remove-circle-sharp' color="red" />}
                            onPress={onConfirmDelete}
                        />


                    </View>
                </View>
            </Row>
            <Row style={{ flex: 5 }}>
                {workoutGroup.media_ids ?
                    <MediaURLSlider
                        data={JSON.parse(workoutGroup.media_ids)}
                        mediaClassID={workoutGroup.id}
                        mediaClass={MEDIA_CLASSES[mediaClass]}
                    />
                    : <></>
                }

            </Row>
            <Row style={{ flex: 1 }}>
                <SmallText>{workoutGroup.caption}</SmallText>
            </Row>

            {

                params.editable ?

                    <>
                        {
                            oGData && showingOGWorkoutGroup && oGData.finished === false ?
                                <View style={{ flex: 1, flexDirection: 'row', marginBottom: 12, justifyContent: 'flex-end', alignContent: 'flex-end', alignItems: 'flex-end', width: '100%' }}>
                                    <View style={{ display: showCreate ? 'flex' : 'none', flexDirection: 'row' }}>
                                        <Button onPress={openCreateWorkoutScreenForStandard.bind(this)} title="Reg" />
                                        <Button onPress={openCreateWorkoutScreenForReps.bind(this)} title="Reps" />
                                        <Button onPress={openCreateWorkoutScreenForRounds.bind(this)} title="Rounds" />
                                        <Button onPress={openCreateWorkoutScreenForTime.bind(this)} title="Timed" />
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Button onPress={() => setShowCreate(!showCreate)} title={showCreate ? "X" : "Add workout"} />
                                        <Button
                                            onPress={() => setFinishWorkoutGroupModalVisible(true)}
                                            title={"Finish"}
                                            style={{ display: !showCreate ? 'flex' : 'none' }}
                                        />
                                    </View>
                                </View>

                                :
                                <></>
                        }
                        {
                            oGData && oGData.finished ?
                                <></> :
                                <View style={{ flex: 1, flexDirection: 'row', width: '100%', marginBottom: 12, justifyContent: 'flex-end', alignItems: 'center' }}>


                                    <TouchableWithoutFeedback onPress={() => setEditable(!editable)}>
                                        <View>
                                            <Switch
                                                value={editable}
                                                onValueChange={(v) => {
                                                    setEditable(!editable)
                                                }}

                                                trackColor={{ true: theme.palette.primary.contrastText, false: theme.palette.primary.contrastText }}
                                                thumbColor={editable ? theme.palette.primary.main : theme.palette.gray}
                                            />
                                            <SmallText>Delete</SmallText>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                        }

                    </>
                    :
                    <></>
            }
            <Row style={{ flex: 1, width: '100%', borderRadius: 8 }}></Row>
            <View style={{
                flex: 4, width: '100%',
                borderRadius: 8,
                backgroundColor: theme.palette.gray,
                paddingVertical: 20,
                paddingLeft: 10,
            }}>
                <Row>
                    <ScrollView>
                        <View style={{ marginTop: 16, marginRight: 8 }}>
                            <StatsPanel
                                tags={tags}
                                names={names}
                            />

                        </View>
                    </ScrollView>
                </Row>

            </View>
            <Row style={{ flex: 1, width: '100%', borderRadius: 8 }}></Row>

            <Row style={{ flex: 9, width: "100%" }}>
                {/* // TODO()  Make this a Flat list and render each workout item in sequence not in a flast list*/}
                {
                    (showingOGWorkoutGroup && oGIsLoading) || (!showingOGWorkoutGroup && completedIsLoading) ?
                        <SmallText>Loading....</SmallText>
                        : (showingOGWorkoutGroup && oGIsSuccess) || (!showingOGWorkoutGroup && completedIsSuccess) ?

                            <WorkoutCardList
                                data={workouts}
                                editable={editable}
                            />




                            : (showingOGWorkoutGroup && oGIsError) || (!showingOGWorkoutGroup && completedIsError) ?

                                <SmallText>Error.... {oGError.toString() | completedError.toString()}</SmallText>
                                :
                                <SmallText>No Data</SmallText>
                }


            </Row>
            <ActionCancelModal
                actionText="Delete Workout Group"
                closeText="Close"
                modalText={`Delete ${title}?`}
                onAction={onDelete}
                modalVisible={deleteWorkoutGroupModalVisible}
                onRequestClose={() => setDeleteWorkoutGroupModalVisible(false)}
            />

            <ActionCancelModal
                actionText="Finish"
                closeText="Close"
                modalText={`Finish ${title}? \n \t cannot be undone`}
                onAction={_finishGroupWorkout}
                modalVisible={finishWorkoutGroupModalVisible}
                onRequestClose={() => setFinishWorkoutGroupModalVisible(false)}
            />
        </WorkoutScreenContainer >
    );
};


export default WorkoutScreen;