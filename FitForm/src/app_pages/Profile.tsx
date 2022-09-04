import React, { FunctionComponent, useState } from "react";
import styled from "styled-components/native";
import { Container } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
import { IconButton, Button } from "@react-native-material/core";
import Icon from 'react-native-vector-icons/Ionicons';

import { useTheme } from 'styled-components'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { useGetProfileViewQuery, useGetUsersWorkoutGroupsQuery } from "../redux/api/apiSlice";

import { WorkoutGroupWorkoutList } from "../app_components/Cards/cardList"
import WorkoutGroupCard from "../app_components/Cards/WorkoutGroupCard"

import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { Modal, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import AuthManager from "../utils/auth";
import { WorkoutGroupCardProps } from "../app_components/Cards/types";

export type Props = StackScreenProps<RootStackParamList, "Profile">

const PageContainer = styled(Container)`
    
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    width: 100%;
`;

const Touchable = styled.TouchableHighlight`
    height: 100%;
    border-radius: 25px;
`;

interface UserInfoPanelProps {
    user: {
        username: string;
        email: string;
        id: number;
    };
}
interface FavGymsPanelProps {
    data: {
        date: string;
        user_id: string;
        id: number;
        gym: {
            id: number;
            date: string;
            desc: string;
            owner_id: string;
            title: string;
        }
    }[]
}
interface FavGymClassesPanelProps {
    data: {
        date: string;
        user_id: string;
        id: number;
        gym_class: {
            id: number;
            date: string;
            desc: string;
            owner_id: string;
            private: boolean;
            title: string;
            gym?: {
                id: number;
                date: string;
                desc: string;
                owner_id: string;
                title: string;
            }
        }
    }[]
}

interface WorkoutPanelProps {
    data: WorkoutGroupCardProps[];

}
// interface WorkoutPanelProps {
//     data: {
//         title: string;
//         caption: string;
//         date: string;
//         id: number;
//         media_ids: string;
//         owner_id: string;
//         owned_by_class: boolean;
//         workouts: {
//             title: string;
//             desc: string;
//             date: string;
//             id: number;
//             scheme_type: number;
//             scheme_rounds: string;
//             workout_items: {
//                 date: string;
//                 duration: number;
//                 duration_unit: number;
//                 id: number;
//                 intensity: number;
//                 name: {
//                     name: string;
//                     date: string;
//                     desc: string;
//                     id: number;
//                     media_ids: string;

//                 };
//                 percent_of: string;
//                 reps: number;
//                 rest_duration: number;
//                 rest_unit: number;
//                 rounds: number;
//                 sets: number;
//                 weight_unit: string;
//                 weights: string;
//                 workout: number;
//             }[];


//         }[]
//     }[]
// }

const UserInfoPanel: FunctionComponent<UserInfoPanelProps> = (props) => {
    const theme = useTheme();
    const { id, email, username } = props.user;
    return (
        <View style={{ width: '100%' }}>
            <View style={{ flexDirection: "row", alignItems: 'center' }}>
                <IconButton onPress={() => { }} color={theme.palette.text} icon={props => <Icon name="person" {...props} />} />
                <RegularText>{username}</RegularText>
            </View>
        </View>
    );
};
const FavGymsPanel: FunctionComponent<FavGymsPanelProps> = (props) => {
    const theme = useTheme();

    const goToGym = (id: number) => {
        console.log("Navigate user to GymClasView with ID: ", id);

    };
    return (
        <View style={{ width: '100%' }}>
            {
                props.data.map(favGym => {
                    const { id, date, gym: { title, id: gym_id } } = favGym;
                    return (
                        <View style={{ height: 50, justifyContent: 'space-between' }} key={`gymfav${id}_${gym_id}`}>
                            <Touchable key={id} underlayColor={theme.palette.transparent}
                                activeOpacity={0.9} onPress={() => goToGym(gym_id)}>
                                <View style={{ flexDirection: "row", alignItems: 'center', }} >
                                    <IconButton onPress={() => { }} color={theme.palette.text} icon={props => <Icon name="star" {...props} />} />
                                    <SmallText>{title}</SmallText>
                                </View>
                            </Touchable>
                        </View>
                    );
                })
            }
        </View>
    );
};
const FavGymClassesPanel: FunctionComponent<FavGymClassesPanelProps> = (props) => {
    const theme = useTheme();
    const goToGymClass = (id: number) => {
        console.log("Navigate user to GymClasView with ID: ", id);

    };

    return (
        <View style={{ width: '100%' }}>
            {
                props.data.map(favGymClass => {
                    const { id, date, gym_class: { title, id: gym_class_id } } = favGymClass;
                    return (
                        <View style={{ height: 50, justifyContent: 'space-between' }} key={`favclass${id}_${gym_class_id}`}>
                            <Touchable key={id} underlayColor={theme.palette.transparent}
                                activeOpacity={0.9} onPress={() => goToGymClass(gym_class_id)}>
                                <View style={{ flexDirection: "row", alignItems: 'center', }} >
                                    <IconButton onPress={() => { }} color={theme.palette.text} icon={props => <Icon name="star" {...props} />} />
                                    <SmallText>{title}</SmallText>
                                </View>
                            </Touchable>
                        </View>
                    );
                })
            }
        </View>
    );
};

const WorkoutsPanel: FunctionComponent<WorkoutPanelProps> = (props) => {
    const theme = useTheme();
    const goToGymClass = (id: number) => {
        console.log("Navigate user to GymClasView with ID: ", id);

    };


    return (
        <WorkoutGroupWorkoutList
            data={props.data}
        />

        // <View style={{ width: '100%' }}>
        //     {
        //         props.data.map(workoutGroup => {
        //             const { id, date, workouts, title, caption } = workoutGroup;
        //             return (
        //                 <View style={{ height: 50, justifyContent: 'space-between' }} key={id}>
        //                     <Touchable key={id} underlayColor={theme.palette.transparent}
        //                         activeOpacity={0.9} onPress={() => goToGymClass(id)}>
        //                         <View style={{ flexDirection: "row", alignItems: 'center', }} >
        //                             <IconButton onPress={() => { }} color={theme.palette.text} icon={props => <Icon name="star" {...props} />} />
        //                             <SmallText>{title} - {caption}</SmallText>
        //                         </View>
        //                     </Touchable>
        //                 </View>
        //             );
        //         })
        //     }
        // </View>
    );
};

const ActionCancelModal: FunctionComponent<{
    modalVisible: boolean; onRequestClose(): void;
    closeText: string; actionText: string; modalText: string;
    onAction(): void;
}> = (props) => {
    const theme = useTheme();
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.modalVisible}
            onRequestClose={props.onRequestClose}
        >
            <View style={styles.centeredView}>
                <View style={{ ...styles.modalView, backgroundColor: theme.palette.darkGray }}>
                    <View style={{ flexDirection: "row", alignItems: 'center', marginBottom: 12 }}>
                        <RegularText>{props.modalText}</RegularText>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: 'center', }}>
                        <Button onPress={props.onRequestClose} title={props.closeText} style={{ marginRight: 4 }} />
                        <Button onPress={props.onAction} title={props.actionText} style={{ marginLeft: 4 }} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};
const ProfileSettingsModal: FunctionComponent<{
    modalVisible: boolean; onRequestClose(): void; nav: Props;
}> = (props) => {
    const theme = useTheme();
    const auth = AuthManager;

    const logout = () => {
        console.log("Loggin out")
        auth.logout()
    };

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
                        <RegularText>Settings</RegularText>
                    </View>
                    <View style={{ alignItems: 'flex-end', flex: 2, width: "100%" }}>
                        <IconButton onPress={() => { logout() }} color={theme.palette.text} icon={props => <Icon name="log-out" {...props} />} />
                        <SmallText>Logout</SmallText>
                    </View>
                    <View style={{ alignItems: 'center', flex: 20 }}>
                        <View style={{ flexDirection: "row", alignItems: 'center' }}>
                            <Button onPress={() => {
                                props.nav.navigation.navigate("CreateGymScreen");
                                props.onRequestClose()
                            }} title="Create gym" />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: 'center' }}>
                            <Button onPress={() => {
                                props.nav.navigation.navigate("CreateGymClassScreen");
                                props.onRequestClose()
                            }} title="Create gym class" />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: 'center' }}>
                            <Button onPress={() => {
                                props.nav.navigation.navigate("CreateWorkoutGroupScreen", { ownedByClass: false });
                                props.onRequestClose()
                            }} title="Create personal workout group" />
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: 'center', flex: 2 }}>
                        <Button onPress={props.onRequestClose} title='Close' />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const Profile: FunctionComponent<Props> = (nav) => {
    const theme = useTheme();
    const { navigation, route } = nav;
    // Access value
    const count = useAppSelector((state) => state.counter.value)
    const { data, isLoading, isSuccess, isError, error } = useGetProfileViewQuery("");
    // const { data: workoutGroups, isLoading: workoutGroupsLoading,
    //     isSuccess: workoutGroupSuccess, isError: workoutGroupErr,
    //     error: workoutGroupError } = useGetUsersWorkoutGroupsQuery("");

    console.log("Profile data: ", data, error)
    // Access/ send actions
    const dispatch = useAppDispatch();
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <PageContainer>
            {
                isLoading ?
                    <SmallText>Loading....</SmallText>
                    : isSuccess ?
                        <View style={{ flex: 1, width: "100%" }}>

                            <View style={{ flex: 1, width: "100%", marginBottom: 16, alignItems: 'flex-end' }}>
                                <IconButton onPress={() => setModalVisible(!modalVisible)} color={theme.palette.text} icon={props => <Icon name="menu" {...props} />} />
                            </View>

                            <View style={{ flex: 1, width: "100%", marginBottom: 16 }}>
                                <UserInfoPanel user={data.user} />
                            </View>

                            <View style={{ flex: 3, width: "100%" }}>
                                <SmallText>Gyms</SmallText>
                                <ScrollView>
                                    <FavGymsPanel data={data.favorite_gyms} />
                                </ScrollView>

                            </View>
                            <View style={{ flex: 3, width: "100%" }}>
                                <SmallText>Gym Classess</SmallText>
                                <ScrollView>
                                    <FavGymClassesPanel data={data.favorite_gym_classes} />
                                </ScrollView>
                            </View>
                            <View style={{ flex: 10, width: "100%" }}>
                                <RegularText>Workouts</RegularText>
                                <WorkoutsPanel data={data.workout_groups} />

                            </View>



                            <ProfileSettingsModal
                                modalVisible={modalVisible}
                                onRequestClose={() => setModalVisible(false)}
                                nav={nav}
                            />
                            {/* <ActionCancelModal
                                actionText="Delete"
                                closeText="Close"
                                modalText="Are you sure?"
                                onAction={() => { console.log("performing action") }}
                                modalVisible={modalVisible}
                                onRequestClose={() => setModalVisible(false)}
                            /> */}
                        </View>
                        : isError ?

                            <SmallText>Error.... {error.toString()}</SmallText>
                            :
                            <SmallText>No Data</SmallText>
            }

        </PageContainer >
    );
};


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

export default Profile;