import React, { FunctionComponent, useRef, useState } from "react";
import styled from "styled-components/native";
import { Container, MEDIA_CLASSES, SCREEN_HEIGHT, SCREEN_WIDTH, withSpaceURL } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { WorkoutGroupCardList } from '../app_components/Cards/cardList'
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { useCreateCoachMutation, useCreateMemberMutation, useDeleteCoachMutation, useDeleteGymClassMutation, useDeleteMemberMutation, useFavoriteGymClassMutation, useGetCoachesForGymClassQuery, useGetGymClassDataViewQuery, useGetMembersForGymClassQuery, useGetProfileViewQuery, useGetUsersQuery, useUnfavoriteGymClassMutation } from "../redux/api/apiSlice";
import { Button, IconButton } from "@react-native-material/core";
import { GymClassCardProps } from "../app_components/Cards/types";
import { ActionCancelModal } from "./Profile";
import { Picker } from "@react-native-picker/picker";
export type Props = StackScreenProps<RootStackParamList, "GymClassScreen">

const GymClassScreenContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    
    width: 100%;
`;
const InfoBG = styled.ImageBackground`
    height: ${SCREEN_HEIGHT * 0.17}px;
    width: ${SCREEN_WIDTH * 0.92}px;
    resize-mode: cover;
    border-radius: 25px;
    overflow: hidden;
    marginBottom: 12px;
`;
const LogoImage = styled.Image`
    width: 100%;
    height: 100%;
    border-radius: 25px;
    flex:1;
`;
const Row = styled.View`
    flex-direction: row;
    justify-content: space-between;
`;


const ManageMembersModal: FunctionComponent<{
    modalVisible: boolean; onRequestClose(): void; gymClassID: string | number;
}> = (props) => {
    const theme = useTheme();
    const pickerRef = useRef<any>();
    const [newMember, setNewMember] = useState(0);
    const { data, isLoading: usersLoading, isSuccess, isError, error } = useGetUsersQuery('');
    const { data: allMembers, isLoading: membersLoading, isSuccess: membersIsSuccess, isError: membersIsError, error: membersError } = useGetMembersForGymClassQuery(props.gymClassID);
    const [createMemberMutation, { isLoading }] = useCreateMemberMutation();
    const [deleteMemberMutation, { isLoading: deleteMemberIsLoading }] = useDeleteMemberMutation();
    const [showRemoveMember, setShowRemoveMember] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(-1);

    console.log("Members user data:  ", allMembers)

    const addNewMember = () => {
        console.log("Adding ", data[newMember])
        const user = data[newMember]
        const memberData = new FormData();
        memberData.append('user_id', user.id);
        memberData.append('gym_class', props.gymClassID);
        createMemberMutation(memberData)
    }

    const onRemoveMember = (memberIdx: number) => {
        setShowRemoveMember(true)
        setMemberToRemove(memberIdx)
    }

    const removeMember = () => {
        const member = allMembers[memberToRemove];
        const removeMemberData = new FormData()
        removeMemberData.append('user_id', member.id)
        removeMemberData.append('gym_class', props.gymClassID)
        deleteMemberMutation(removeMemberData)
    }

    const currentMemberToDelete = memberToRemove > -1 ? allMembers[memberToRemove].username : { username: '' }
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.modalVisible}
            onRequestClose={props.onRequestClose}
        >
            <View style={styles.centeredView}>
                <View style={{ ...styles.settingsModalView, backgroundColor: theme.palette.darkGray }}>
                    <View style={{ flexDirection: "row", alignItems: 'center', marginBottom: 12, flex: 1 }}>
                        <RegularText>Manage Members</RegularText>
                    </View>


                    <View style={{ flex: 2, width: '100%' }}>
                        {
                            !usersLoading ?
                                <View style={{ justifyContent: 'flex-start' }}>

                                    <Picker
                                        ref={pickerRef}
                                        style={{ height: 100 }}
                                        itemStyle={{
                                            height: 100,
                                            color: theme.palette.text,
                                            backgroundColor: theme.palette.backgroundColor
                                        }}

                                        selectedValue={newMember}
                                        onValueChange={(itemValue, itemIndex) =>
                                            setNewMember(itemIndex)
                                        }>
                                        {
                                            data.map(user => {
                                                return (
                                                    <Picker.Item key={user.id} label={user.username} value={user.id} />
                                                );
                                            })
                                        }
                                    </Picker>
                                    <Button
                                        title="Add Member"
                                        onPress={addNewMember}
                                    />

                                </View>
                                :
                                <></>
                        }
                    </View>



                    <RegularText textStyles={{ alignSelf: 'flex-start' }}>Members</RegularText>

                    {
                        !membersLoading ?
                            <ScrollView style={{ width: '100%', flex: 1 }} contentContainerStyle={{ justifyContent: 'center' }} >
                                {
                                    allMembers?.map((member, i) => {
                                        console.log("Member :: ", member)
                                        return (
                                            <View key={`key_${i}__`} style={{
                                                justifyContent: 'center', alignItems: 'center', width: '100%',
                                                borderBottomWidth: 1,
                                                borderTopWidth: 1,
                                                borderColor: 'white',
                                                paddingVertical: 8,
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                                    <View style={{ flex: 5, alignItems: 'flex-start', paddingLeft: 16 }}>
                                                        <RegularText>{member.username}</RegularText>
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <IconButton style={{ height: 24 }} icon={<Icon name='remove-circle-sharp' color="red" style={{ fontSize: 24 }} />} onPress={() => { onRemoveMember(i) }} />
                                                    </View>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </ScrollView>
                            :
                            <></>
                    }

                    <View style={{ flexDirection: "row", alignItems: 'center', flex: 2 }}>
                        <Button onPress={props.onRequestClose} title='Close' />
                    </View>
                </View>
            </View>
            <ActionCancelModal
                actionText="Delete user"
                closeText="Close"
                modalText={`Delete ${currentMemberToDelete}?`}
                onAction={removeMember}
                modalVisible={showRemoveMember}
                onRequestClose={() => setShowRemoveMember(false)}
            />
        </Modal>
    );
};


const ManageCoachesModal: FunctionComponent<{
    modalVisible: boolean; onRequestClose(): void; gymClassID: string | number;
}> = (props) => {
    const theme = useTheme();
    const pickerRef = useRef<any>();
    const [newCoach, setNewCoach] = useState(0);
    const { data, isLoading: usersLoading, isSuccess, isError, error } = useGetUsersQuery('');
    const { data: allCoaches, isLoading: coachesLoading, isSuccess: coachesIsSuccess, isError: coachesIsError, error: coachesError } = useGetCoachesForGymClassQuery(props.gymClassID);
    const [createCoachMutation, { isLoading }] = useCreateCoachMutation();
    const [deleteCoachMutation, { isLoading: deleteCoachIsLoading }] = useDeleteCoachMutation();
    const [showRemoveCoach, setShowRemoveCoach] = useState(false);
    const [coachToRemove, setCoachToRemove] = useState(-1);

    console.log("Coaches user data:  ", allCoaches)

    const addNewCoach = () => {
        console.log("Adding ", data[newCoach])
        const user = data[newCoach]
        const coachData = new FormData();
        coachData.append('user_id', user.id);
        coachData.append('gym_class', props.gymClassID);
        createCoachMutation(coachData)
    }

    const onRemoveCoach = (coachIdx: number) => {
        setShowRemoveCoach(true)
        setCoachToRemove(coachIdx)
    }

    const removeCoach = () => {
        const coach = allCoaches[coachToRemove];
        const removeCoachData = new FormData()
        removeCoachData.append('user_id', coach.id)
        removeCoachData.append('gym_class', props.gymClassID)
        deleteCoachMutation(removeCoachData)
    }

    const currentCoachToDelete = coachToRemove > -1 ? allCoaches[coachToRemove].username : { username: '' }
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.modalVisible}
            onRequestClose={props.onRequestClose}
        >
            <View style={styles.centeredView}>
                <View style={{ ...styles.settingsModalView, backgroundColor: theme.palette.darkGray }}>
                    <View style={{ flexDirection: "row", alignItems: 'center', marginBottom: 12, flex: 1 }}>
                        <RegularText>Manage Coaches</RegularText>
                    </View>


                    <View style={{ flex: 2, width: '100%' }}>
                        {
                            !usersLoading ?
                                <View style={{ justifyContent: 'flex-start' }}>

                                    <Picker
                                        ref={pickerRef}
                                        style={{ height: 100 }}
                                        itemStyle={{
                                            height: 100,
                                            color: theme.palette.text,
                                            backgroundColor: theme.palette.backgroundColor
                                        }}

                                        selectedValue={newCoach}
                                        onValueChange={(itemValue, itemIndex) =>
                                            setNewCoach(itemIndex)
                                        }>
                                        {
                                            data.map(user => {
                                                return (
                                                    <Picker.Item key={user.id} label={user.username} value={user.id} />
                                                );
                                            })
                                        }
                                    </Picker>
                                    <Button
                                        title="Add Coach"
                                        onPress={addNewCoach}
                                    />

                                </View>
                                :
                                <></>
                        }
                    </View>



                    <RegularText textStyles={{ alignSelf: 'flex-start' }}>Coaches</RegularText>

                    {
                        !coachesLoading ?
                            <ScrollView style={{ width: '100%', flex: 1 }} contentContainerStyle={{ justifyContent: 'center' }} >
                                {
                                    allCoaches?.map((coach, i) => {
                                        console.log("C :: ", coach)
                                        return (
                                            <View key={`key_${i}__`} style={{
                                                justifyContent: 'center', alignItems: 'center', width: '100%',
                                                borderBottomWidth: 1,
                                                borderTopWidth: 1,
                                                borderColor: 'white',
                                                paddingVertical: 8,
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                                    <View style={{ flex: 5, alignItems: 'flex-start', paddingLeft: 16 }}>
                                                        <RegularText>{coach.username}</RegularText>
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <IconButton style={{ height: 24 }} icon={<Icon name='remove-circle-sharp' color="red" style={{ fontSize: 24 }} />} onPress={() => { onRemoveCoach(i) }} />
                                                    </View>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </ScrollView>
                            :
                            <></>
                    }

                    <View style={{ flexDirection: "row", alignItems: 'center', flex: 2 }}>
                        <Button onPress={props.onRequestClose} title='Close' />
                    </View>
                </View>
            </View>
            <ActionCancelModal
                actionText="Delete user"
                closeText="Close"
                modalText={`Delete ${currentCoachToDelete}?`}
                onAction={removeCoach}
                modalVisible={showRemoveCoach}
                onRequestClose={() => setShowRemoveCoach(false)}
            />
        </Modal>
    );
};


const GymClassScreen: FunctionComponent<Props> = ({ navigation, route: { params } }) => {
    const theme = useTheme();
    const { id, logoImage, mainImage, title, desc, gym, date, private: is_private } = params || {};

    const [deleteGymClassModalVisible, setDeleteGymClassModalVisibleVisible] = useState(false);
    const [showCoachModal, setShowCoachModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);

    const { data: allMembers, isLoading: membersLoading,
        isSuccess: membersIsSuccess, isError: membersIsError, error: membersError
    } = useGetMembersForGymClassQuery(id);
    const { data: allCoaches, isLoading: coachesLoading,
        isSuccess: coachesIsSuccess, isError: coachesIsError, error: coachesError
    } = useGetCoachesForGymClassQuery(id);

    const { data, isLoading, isSuccess, isError, error } = useGetGymClassDataViewQuery(id);
    const [deleteGymClassMutation, { isLoading: isDeleteGymClassLoading }] = useDeleteGymClassMutation()
    const mainURL = withSpaceURL('main', parseInt(id), MEDIA_CLASSES[1])
    const logoURL = withSpaceURL('logo', parseInt(id), MEDIA_CLASSES[1])

    const { data: userData, isLoading: userDataIsLoading, isSuccess: userDataIsSuccess, isError: userDataIsError, error: userDataError } = useGetProfileViewQuery("");
    const [favoriteGymClassMutation, { isLoading: favGymLoading }] = useFavoriteGymClassMutation();
    const [unfavoriteGymClassMutation, { isLoading: unfavGymLoading }] = useUnfavoriteGymClassMutation();
    const isFavorited = (classes: { id: number; user_id: string; date: string; gym_class: GymClassCardProps }[]) => {
        let faved = false;
        classes.forEach(favClass => {
            if (favClass.gym_class.id == id) {
                faved = true;
            }
        })
        return faved;
    }

    console.log("GClass params: ", params)
    console.log("GClass data: ", data)

    const favObj = new FormData();
    favObj.append('gym_class', id)

    const onConfirmDelete = () => {
        setDeleteGymClassModalVisibleVisible(true)
    }

    const onDelete = async () => {
        const deletedGym = await deleteGymClassMutation(id).unwrap();
        console.log("Deleted Gym: ", deletedGym)
        setDeleteGymClassModalVisibleVisible(false)
    }
    return (
        <GymClassScreenContainer>
            <View style={{ flex: 1 }}>
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    justifyContent: 'center', width: "100%"
                }}>
                    <View style={{ flex: 1 }}></View>
                    <View style={{ flex: 5 }}>
                        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                            <LargeText textStyles={{ textAlign: 'center' }}>
                                {title} {data?.user_is_gym_owner ? "(Owner)" : data?.user_is_coach ? "(Coach)" : ""}
                            </LargeText>
                            <View style={{ alignItems: 'center', paddingLeft: 16 }}>
                                <SmallText>Coaches: {allCoaches?.length ? allCoaches.length : 0}</SmallText>
                                <SmallText>Members: {allMembers?.length ? allMembers.length : 0}</SmallText>
                            </View>
                        </View>


                        <View style={{ flexDirection: 'row', width: '50%' }}>

                            {
                                data?.user_is_gym_owner ?

                                    <Button title="Manage Coaches"
                                        onPress={() => setShowCoachModal(true)}
                                    />
                                    :
                                    <></>
                            }


                            {
                                data?.user_is_coach ?
                                    <Button title="Manage Members"
                                        onPress={() => setShowMembersModal(true)}
                                    />
                                    :
                                    <></>
                            }

                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        {
                            userData &&
                                isFavorited(userData.favorite_gym_classes) ?
                                <IconButton style={{ height: 24 }} icon={<Icon name='star' color="red" style={{ fontSize: 24 }} />} onPress={() => unfavoriteGymClassMutation(favObj)} />
                                :
                                <IconButton style={{ height: 24 }} icon={<Icon name='star' color="white" style={{ fontSize: 24 }} />} onPress={() => favoriteGymClassMutation(favObj)} />
                        }
                    </View>
                </View>
            </View>

            <View style={{ flex: 2 }}>
                <InfoBG source={{ uri: mainURL }}>
                    {/* <RegularText textStyles={{ paddingRight: 12 }}>{title}</RegularText> */}
                    <Row style={{ flex: 1, justifyContent: "flex-end", alignItems: "flex-end" }}>
                        <ScrollView style={{ maxHeight: '50%', width: '55%', marginBottom: 8, }}>
                            <RegularText textStyles={{ flex: 2, paddingLeft: 16, }}>{desc}</RegularText>
                        </ScrollView>
                        <LogoImage
                            source={{ uri: logoURL }}
                            style={{ marginRight: 12, height: SCREEN_HEIGHT * 0.05, marginBottom: 8 }}
                        />
                    </Row>
                </InfoBG>

            </View>
            {
                !isLoading && data && data.user_can_edit ?
                    <View style={{ flex: 1 }}>
                        <View style={{ marginVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                            <Button
                                title="Create workout group"
                                onPress={() => {
                                    navigation.navigate("CreateWorkoutGroupScreen", { ownedByClass: true, ownerID: id });
                                }}
                            />
                            {
                                data?.user_is_gym_owner ?
                                    <IconButton style={{ height: 24 }} icon={<Icon name='remove-circle-sharp' color="red" style={{ fontSize: 24 }} />} onPress={onConfirmDelete} />
                                    : <></>
                            }

                        </View>
                    </View>

                    :
                    <></>
            }



            <View style={{ flex: 4 }}>
                <Row style={{ color: "black" }}>
                    <SmallText >Workouts</SmallText>
                </Row>
                {
                    isLoading ?
                        <SmallText>Loading....</SmallText>
                        : isSuccess ?

                            <WorkoutGroupCardList data={data.workout_groups} editable={data.user_can_edit} />

                            : isError ?

                                <SmallText>Error.... {error.toString()}</SmallText>
                                :
                                <SmallText>No Data</SmallText>
                }
            </View>
            <ManageMembersModal
                modalVisible={showMembersModal}
                onRequestClose={() => setShowMembersModal(false)}
                gymClassID={id}

            />
            <ManageCoachesModal
                modalVisible={showCoachModal}
                onRequestClose={() => setShowCoachModal(false)}
                gymClassID={id}

            />
            <ActionCancelModal
                actionText="Delete gym class"
                closeText="Close"
                modalText={`Delete ${title}?`}
                onAction={onDelete}
                modalVisible={deleteGymClassModalVisible}
                onRequestClose={() => setDeleteGymClassModalVisibleVisible(false)}
            />
        </GymClassScreenContainer >
    );
};


export default GymClassScreen;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    settingsModalView: {
        width: "90%",
        height: "90%",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});
