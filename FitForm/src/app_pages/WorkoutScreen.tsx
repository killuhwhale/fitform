import React, { FunctionComponent, useState } from "react";
import styled from "styled-components/native";
import { Container, MEDIA_CLASSES, SCREEN_HEIGHT, SCREEN_WIDTH } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { WorkoutCardList, WorkoutGroupWorkoutList, WorkoutItemCardList } from '../app_components/Cards/cardList'

import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { WorkoutCardProps } from "../app_components/Cards/types";
import { ScrollView } from "react-native-gesture-handler";
import { TouchableWithoutFeedback, View } from "react-native";
import { useDeleteWorkoutGroupMutation, useGetWorkoutsForGymClassWorkoutGroupQuery, useGetWorkoutsForUsersWorkoutGroupsQuery } from "../redux/api/apiSlice";
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



const WorkoutScreen: FunctionComponent<Props> = ({ navigation, route: { params } }) => {
    const theme = useTheme();
    const { id, title, caption, owned_by_class, owner_id, media_ids } = params.data || {}; // Workout group
    let queryResult;
    if (owned_by_class) {
        queryResult = useGetWorkoutsForGymClassWorkoutGroupQuery(id);

    } else {
        queryResult = useGetWorkoutsForUsersWorkoutGroupsQuery(id);

    }
    const { data, isLoading, isSuccess, isError, error } = queryResult;

    // Fetch workouts for WorkoutGroup, call depedning on owned_by_class
    const workoutGroup = data ? data : {} as WorkoutCardProps
    const [editable, setEditable] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    // console.log("WorkoutScreen props: ", params);
    // console.log("Fetch all workouts for Workout Group: ", params)


    const openCreateWorkoutScreenForStandard = () => {
        navigation.navigate("CreateWorkoutScreen", {
            workoutGroupID: id.toString(),
            workoutGroupTitle: title,
            schemeType: 0
        })
    }
    const openCreateWorkoutScreenForReps = () => {
        navigation.navigate("CreateWorkoutScreen", {
            workoutGroupID: id.toString(),
            workoutGroupTitle: title,
            schemeType: 1
        })
    }
    const openCreateWorkoutScreenForRounds = () => {
        navigation.navigate("CreateWorkoutScreen", {
            workoutGroupID: id.toString(),
            workoutGroupTitle: title,
            schemeType: 2
        })
    }
    const openCreateWorkoutScreenForTime = () => {
        navigation.navigate("CreateWorkoutScreen", {
            workoutGroupID: id.toString(),
            workoutGroupTitle: title,
            schemeType: 3
        })
    }

    const [deleteWorkoutGroupMutation, { isLoading: isDeleteGymClassLoading }] = useDeleteWorkoutGroupMutation()
    const [deleteWorkoutGroupModalVisible, setDeleteWorkoutGroupModalVisibleVisible] = useState(false);

    const onConfirmDelete = () => {
        setDeleteWorkoutGroupModalVisibleVisible(true)
    }
    const onDelete = async () => {
        const deletedWorkoutGroup = await deleteWorkoutGroupMutation(id).unwrap();
        setDeleteWorkoutGroupModalVisibleVisible(false)
    }

    const [tags, names] = processMultiWorkoutStats(workoutGroup.workouts)

    return (
        <WorkoutScreenContainer>


            <Row style={{ flex: 1 }}>
                <RegularText>{title} ({id})</RegularText>
            </Row>
            <Row style={{ flex: 5 }}>
                <MediaURLSlider
                    data={JSON.parse(media_ids)}
                    mediaClassID={id}
                    mediaClass={MEDIA_CLASSES[2]}
                />

            </Row>
            <Row style={{ flex: 1 }}>
                <SmallText>{caption}</SmallText>
            </Row>
            {/* 
                ToDO
                Create a new  <MediaSlider
                                data={files}
                            />

                Need a new one because the one we have takes ImageOrVideo which is returned from Picker.
                We need One to Display from a list of urls, string[]
                Basically, just dulicate and use different props for file info...

                Then,
                Create a page to create a workout to add to the current, WGroup
                Add a button here to nav to that page, passing this WGroup id over
            */}
            {
                // Instead of a simple boolean, lets use something that indicates ownership
                // WE should check if the user is an owner or coach of this Gym/Class/Workout
                // Simple bool is good for user's view from Profile page since we can allow the user to have the editable view.

                // How should we determine?  // Add attr userCanEdit to getWorkoutGroup queries, 
                params.editable ?
                    <>
                        <View style={{ flex: 1, flexDirection: 'row', marginBottom: 12, justifyContent: 'flex-end', alignContent: 'flex-end', alignItems: 'flex-end', width: '100%' }}>
                            <View style={{ display: showCreate ? 'flex' : 'none', flexDirection: 'row' }}>
                                <Button onPress={openCreateWorkoutScreenForStandard.bind(this)} title="Reg" />
                                <Button onPress={openCreateWorkoutScreenForReps.bind(this)} title="Reps" />
                                <Button onPress={openCreateWorkoutScreenForRounds.bind(this)} title="Rounds" />
                                <Button onPress={openCreateWorkoutScreenForTime.bind(this)} title="Timed" />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Button onPress={() => setShowCreate(!showCreate)} title={showCreate ? "X" : "Add workout"} />
                                <IconButton style={{ height: 24, display: !showCreate ? 'flex' : 'none', }} icon={<Icon name='remove-circle-sharp' color="red" style={{ fontSize: 24 }} />} onPress={onConfirmDelete} />
                            </View>

                        </View>

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
                    isLoading ?
                        <SmallText>Loading....</SmallText>
                        : isSuccess ?

                            <WorkoutCardList
                                data={workoutGroup.workouts}
                                editable={editable}
                            />




                            : isError ?

                                <SmallText>Error.... {error.toString()}</SmallText>
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
                onRequestClose={() => setDeleteWorkoutGroupModalVisibleVisible(false)}
            />
        </WorkoutScreenContainer >
    );
};


export default WorkoutScreen;