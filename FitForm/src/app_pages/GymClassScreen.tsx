import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import styled from "styled-components/native";
import { Container, MEDIA_CLASSES, SCREEN_HEIGHT, SCREEN_WIDTH, withSpaceURL } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { WorkoutGroupCardList } from '../app_components/Cards/cardList'
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { ImageBackground, Modal, ScrollView, StyleSheet, View } from "react-native";
import { useCreateCoachMutation, useCreateMemberMutation, useDeleteCoachMutation, useDeleteGymClassMutation, useDeleteMemberMutation, useFavoriteGymClassMutation, useGetCoachesForGymClassQuery, useGetGymClassDataViewQuery, useGetMembersForGymClassQuery, useGetProfileGymClassFavsQuery, useGetProfileViewQuery, useGetUsersQuery, useUnfavoriteGymClassMutation } from "../redux/api/apiSlice";
import { Button, IconButton } from "@react-native-material/core";
import { GymClassCardProps } from "../app_components/Cards/types";
import { ActionCancelModal } from "./Profile";
import { Picker } from "@react-native-picker/picker";
import { filter } from "../utils/algos";
import { Input } from "./input_pages/gyms/CreateWorkoutScreen";
import bluish from "./../../assets/bgs/bluish.png"
import greenGrad from "./../../assets/bgs/greenGrad.png"
export type Props = StackScreenProps<RootStackParamList, "GymClassScreen">

const GymClassScreenContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    
    width: 100%;
`;
const InfoBG = styled.ImageBackground`
    height: 100%;
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
        if (data[newMember] == undefined) {
            console.log("Invalid member")
            return
        }
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
        setMemberToRemove(-1)
        setShowRemoveMember(false)
    }


    const currentMemberToDelete = memberToRemove > -1 &&
        allMembers.legngth > 0 && memberToRemove < allMembers.length ?
        allMembers[memberToRemove]?.username :
        { username: '' }

    const [stringData, setOgData] = useState<string[]>(data ? data.map(user => user.username) : [])
    const [filterResult, setFilterResult] = useState<number[]>(Array.from(Array(stringData.length).keys()).map((idx) => idx))
    useEffect(() => {
        setOgData(data ? data.map(user => user.username) : [])
        setFilterResult(Array.from(Array(data?.length || 0).keys()).map((idx) => idx))
        if (data?.length <= 0) {
            setNewMember(-1) // When new term is entered, reset coach if no items in filtered result.
        }
    }, [data])

    const [term, setTerm] = useState("");
    const filterText = (term: string) => {
        // Updates filtered data.
        const { items, marks } = filter(term, stringData, { word: false })
        setFilterResult(items)
        setTerm(term)
        if (items?.length <= 0) {
            setNewMember(-1) // When new term is entered, reset coach if no items in filtered result.
        } else {
            setNewMember(items[0]) // Update new Coach to  firs filtered result.
        }
    }
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


                    <View style={{ flex: 3, width: '100%' }}>
                        {
                            !usersLoading ?
                                <View style={{ justifyContent: 'flex-start' }}>
                                    <View style={{ height: 40, marginTop: 16 }}>
                                        <Input
                                            onChangeText={filterText}
                                            value={term}
                                            containerStyle={{
                                                width: '100%',
                                                backgroundColor: theme.palette.lightGray,
                                                borderRadius: 8,
                                                paddingHorizontal: 8,
                                                
                                            }}
                                        fontSize={16}
                                            leading={
                                                <Icon name="search" style={{ fontSize: 16 }} color={theme.palette.text} />
                                            }
                                            label=""
                                            placeholder="Search users"
                                        />
                                    </View>
                                    <Picker
                                        ref={pickerRef}
                                        style={{ height: 180, }}

                                        itemStyle={{
                                            height: '100%',
                                            fontSize: 16,
                                            color: theme.palette.text,
                                            backgroundColor: theme.palette.backgroundColor
                                        }}


                                        selectedValue={newMember}
                                        onValueChange={(itemValue, itemIndex) =>
                                            setNewMember(itemValue)
                                        }>
                                        {
                                            filterResult.map((filtered_index) => {
                                                const user = data[filtered_index]
                                                return (
                                                    <Picker.Item key={user.id} label={user.username} value={filtered_index} />
                                                );
                                            })
                                        }
                                    </Picker>
                                    <Button
                                        title="Add Member"
                                        onPress={addNewMember}
                                        style={{ backgroundColor: theme.palette.lightGray }}
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
                        <Button onPress={props.onRequestClose} title='Close' style={{ backgroundColor: theme.palette.lightGray }} />
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
    const { data, isLoading: usersLoading, isSuccess, isError, error } = useGetUsersQuery('');
    const [newCoach, setNewCoach] = useState(data?.length > 0 ? 0 : -1); // if we have users, init to 0, the first user, else we do not have any coaches to add
    const { data: allCoaches, isLoading: coachesLoading, isSuccess: coachesIsSuccess, isError: coachesIsError, error: coachesError } = useGetCoachesForGymClassQuery(props.gymClassID);
    const [createCoachMutation, { isLoading }] = useCreateCoachMutation();
    const [deleteCoachMutation, { isLoading: deleteCoachIsLoading }] = useDeleteCoachMutation();
    const [showRemoveCoach, setShowRemoveCoach] = useState(false);
    const [coachToRemove, setCoachToRemove] = useState(-1);

    console.log("Coaches user data:  ", allCoaches)

    const addNewCoach = () => {
        console.log("Adding ", newCoach, data[newCoach])
        if (data[newCoach] == undefined) {
            console.log("Invalid member")
            return
        }
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

    const removeCoach = async () => {
        const coach = allCoaches[coachToRemove];
        console.log("Reoving coach: ", coach, coachToRemove, allCoaches)
        const removeCoachData = new FormData()
        removeCoachData.append('user_id', coach?.id)
        removeCoachData.append('gym_class', props.gymClassID)
        const res = await deleteCoachMutation(removeCoachData).unwrap()
        console.log("del res", res)
        setCoachToRemove(-1)
        setShowRemoveCoach(false)
        if (res.data) {

        }
    }

    const currentCoachToDelete = coachToRemove > -1 &&
        allCoaches.legngth > 0 &&
        coachToRemove < allCoaches.length ?
        allCoaches[coachToRemove]?.username
        :
        { username: '' }

    const [stringData, setOgData] = useState<string[]>(data ? data.map(user => user.username) : [])
    const [filterResult, setFilterResult] = useState<number[]>(Array.from(Array(stringData.length).keys()).map((idx) => idx))
    useEffect(() => {
        setOgData(data ? data.map(user => user.username) : [])
        setFilterResult(Array.from(Array(data?.length || 0).keys()).map((idx) => idx))
        if (data?.length <= 0) {
            setNewCoach(-1) // When new term is entered, reset coach if no items in filtered result.
        }
    }, [data])

    const [term, setTerm] = useState("");
    const filterText = (term: string) => {
        // Updates filtered data.
        const { items, marks } = filter(term, stringData, { word: false })
        setFilterResult(items)
        setTerm(term)
        if (items?.length <= 0) {
            setNewCoach(-1) // When new term is entered, reset coach if no items in filtered result.
        } else {
            setNewCoach(items[0]) // Update new Coach to  firs filtered result.
        }
    }
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


                    <View style={{ flex: 3, width: '100%' }}>
                        {
                            !usersLoading ?
                                <View style={{ justifyContent: 'flex-start' }}>
                                    <View style={{ height: 40, marginTop: 16 }}>
                                        <Input
                                            onChangeText={filterText}
                                            value={term}
                                            containerStyle={{
                                                width: '100%',
                                                backgroundColor: theme.palette.lightGray,
                                                borderRadius: 8,
                                                paddingHorizontal: 8,
                                            }}
                                            leading={
                                                <Icon name="search" style={{ fontSize: 24 }} color={theme.palette.text} />
                                            }
                                            label=""
                                            placeholder="Search users"
                                        />
                                    </View>

                                    <Picker
                                        ref={pickerRef}
                                        style={{ height: 180, }}

                                        itemStyle={{
                                            height: '100%',
                                            fontSize: 16,
                                            color: theme.palette.text,
                                            backgroundColor: theme.palette.backgroundColor
                                        }}

                                        selectedValue={newCoach}
                                        onValueChange={(itemValue, itemIndex) =>
                                            setNewCoach(itemValue)
                                        }>
                                        {
                                            filterResult.map((filtered_index) => {
                                                const user = data[filtered_index]
                                                return (
                                                    <Picker.Item style={{ height: 5 }} key={user.id} label={user.username} value={filtered_index} />
                                                );
                                            })
                                        }
                                    </Picker>
                                    <Button
                                        title="Add Coach"
                                        onPress={addNewCoach}
                                        style={{ backgroundColor: theme.palette.lightGray }}
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
                        <Button onPress={props.onRequestClose} title='Close' style={{ backgroundColor: theme.palette.lightGray }} />
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

    const {
        data,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetGymClassDataViewQuery(id);

    const [deleteGymClassMutation, { isLoading: isDeleteGymClassLoading }] = useDeleteGymClassMutation()
    const mainURL = withSpaceURL('main', parseInt(id), MEDIA_CLASSES[1])
    const logoURL = withSpaceURL('logo', parseInt(id), MEDIA_CLASSES[1])

    // Separate workout groups into separate query for better caching.

    const {
        data: dataGymClassFavs,
        isLoading: isLoadingGymClassFavs,
        isSuccess: isSuccessGymClassFavs,
        isError: isErrorGymClassFavs,
        error: errorGymClassFavs
    } = useGetProfileGymClassFavsQuery("");

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
    const favObj = new FormData();
    favObj.append('gym_class', id)
    console.log("GClass params: ", params)
    console.log("GClass data: ", data)


    const onConfirmDelete = () => {
        setDeleteGymClassModalVisibleVisible(true)
    }
    const onDelete = async () => {
        // Pass data to invalidate tags in order to refresh class list
        if (!gym || !id) {
            console.log("Error deleting GymClass")
            return
        }

        const data = {
            gymID: gym,
            gymClassID: id,
        }
        console.log("Deleting gymClass", data)
        const deletedGym = await deleteGymClassMutation(data).unwrap();
        console.log("Deleted Gym: ", deletedGym)
        setDeleteGymClassModalVisibleVisible(false)
        if (deletedGym.id) {
            navigation.goBack()
        }
    }

    // TODO replace with separate use...
    const workoutGroups = data?.workout_groups || []

    // Search feature
    const [stringData, setOgData] = useState<string[]>(workoutGroups ? workoutGroups.map(group => group.title) : [])
    const [filterResult, setFilterResult] = useState<number[]>(Array.from(Array(stringData.length).keys()).map((idx) => idx))

    // Init search with data, update each time we get new data
    useEffect(() => {
        setOgData(workoutGroups ? workoutGroups.map(group => group.title) : [])
        setFilterResult(Array.from(Array(workoutGroups?.length || 0).keys()).map((idx) => idx))
    }, [data])

    // Filter current data
    const [term, setTerm] = useState("");
    const filterText = (term: string) => {
        // Updates filtered data.
        const { items, marks } = filter(term, stringData, { word: false })
        setFilterResult(items)
        setTerm(term)
    }
    return (
        <GymClassScreenContainer>
            <ImageBackground
                source={greenGrad}
                style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: SCREEN_WIDTH * .0314,
                    height: SCREEN_HEIGHT * 0.0662607,

                }}>
            </ImageBackground>
            <ImageBackground
                source={greenGrad}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: SCREEN_WIDTH * .0314,
                    height: SCREEN_HEIGHT * 0.0662607,

                }}>
            </ImageBackground>

            <View style={{
                flexDirection: 'row', alignItems: 'center', alignContent: 'center',
                justifyContent: 'center', width: "100%", height: SCREEN_HEIGHT * 0.0662607,
            }}>

                <View style={{ position: 'absolute', width: '90%', alignItems: 'center', height: '100%', }}>
                    <ScrollView horizontal style={{ marginRight: SCREEN_WIDTH * .0914 }}>
                        <View style={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <RegularText textStyles={{ textAlign: 'center' }}>
                                {title} {data?.user_is_owner ? "(Owner)" : data?.user_is_coach ? "(Coach)" : ""}
                            </RegularText>
                        </View>

                    </ScrollView>
                </View>
                <View style={{ position: 'absolute', right: SCREEN_WIDTH * .0314 +  8, marginLeft: 8 }}>
                    {
                        dataGymClassFavs && !isLoadingGymClassFavs &&
                            isFavorited(dataGymClassFavs?.favorite_gym_classes) ?
                            <View style={{ alignItems: 'center' }}>
                                <IconButton style={{ height: 24 }} icon={<Icon name='star' color="red" style={{ fontSize: 24 }} />} onPress={() => unfavoriteGymClassMutation(favObj)} />
                                <SmallText>Unfavorite</SmallText>
                            </View>
                            :
                            <View style={{ alignItems: 'center' }}>
                                <IconButton style={{ height: 24 }} icon={<Icon name='star' color="white" style={{ fontSize: 24 }} />} onPress={() => favoriteGymClassMutation(favObj)} />
                                <SmallText>Favorite</SmallText>
                            </View>
                    }
                </View>
            </View>

            {
                data?.user_is_owner || data?.user_is_coach ?
                    <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        justifyContent: 'flex-end', width: "100%", flex: 1
                    }}>

                        {
                            data?.user_is_owner ?
                                <View style={{ paddingHorizontal: 8 }}>
                                    <IconButton
                                        style={{ height: 24 }}
                                        icon={
                                            <Icon name='ios-stopwatch-outline' color={theme.palette.primary.main} style={{ fontSize: 24 }} />
                                        }
                                        onPress={() => setShowCoachModal(true)}
                                    />
                                    <SmallText>Coaches: {allCoaches?.length ? allCoaches.length : 0}</SmallText>

                                </View>
                                :
                                <></>
                        }
                        {
                            data?.user_is_owner || data?.user_is_coach ?
                                <View style={{ paddingHorizontal: 8 }}>
                                    <IconButton
                                        style={{ height: 24 }}
                                        icon={
                                            <Icon name='ios-people-outline' color={theme.palette.secondary.main} style={{ fontSize: 24 }} />
                                        }
                                        onPress={() => setShowMembersModal(true)}
                                    />
                                    <SmallText>Members: {allMembers?.length ? allMembers.length : 0}</SmallText>
                                </View>
                                :
                                <></>
                        }


                    </View>
                    : <></>
            }


            <View style={{ flex: 2 }}>
                <InfoBG source={{ uri: mainURL }} >
                    <View style={{ width: '100%', height: '25%', position: 'absolute', bottom: 0, backgroundColor: theme.palette.transparent }}></View>
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
                                style={{ backgroundColor: theme.palette.lightGray }}
                                onPress={() => {
                                    navigation.navigate("CreateWorkoutGroupScreen", { ownedByClass: true, ownerID: id, gymClassProps: params });
                                }}
                            />
                            {
                                data?.user_is_owner ?
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
                    <View style={{ height: 40, marginTop: 16 }}>
                        <Input
                            onChangeText={filterText}
                            value={term}
                            containerStyle={{
                                width: '100%',
                                backgroundColor: theme.palette.lightGray,
                                borderRadius: 8,
                                paddingHorizontal: 8,
                            }}
                            fontSize={16}
                            leading={
                                <Icon name="search" style={{ fontSize: 16 }} color={theme.palette.text} />
                            }
                            label=""
                            placeholder="Search workouts"
                        />
                    </View>
                </Row>
                {
                    isLoading ?
                        <SmallText>Loading....</SmallText>
                        : isSuccess ?

                            <WorkoutGroupCardList data={workoutGroups.filter((_, i) => filterResult.indexOf(i) >= 0)} editable={data.user_can_edit} />

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
