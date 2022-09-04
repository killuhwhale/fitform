import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { Container, SCREEN_HEIGHT, SCREEN_WIDTH } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { WorkoutGroupWorkoutList, WorkoutItemCardList } from '../app_components/Cards/cardList'

import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { WorkoutCardProps } from "../app_components/Cards/types";
import { ScrollView } from "react-native-gesture-handler";
import { View } from "react-native";
import { useGetWorkoutGroupClassDataViewQuery } from "../redux/api/apiSlice";
import { Button } from "@react-native-material/core";
export type Props = StackScreenProps<RootStackParamList, "WorkoutScreen">

// Normal set x reps
const mock_workout_data_0 = {
    "id": "7",
    "workout_items": [
        {
            "id": "5",
            "name": {
                "id": "1",
                "name": "Squat",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "5",
            "reps": "5",
            "duration": "0.0",
            "duration_unit": "-1",
            "weights": "[10, 20, 30, 40, 50]",
            "weight_unit": "%",
            "intensity": "-1",
            "rest_duration": "-10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        },
        {
            "id": "6",
            "name": {
                "id": "2",
                "name": "Bench Press",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "3",
            "reps": "5",
            "duration": "0.0",
            "duration_unit": "-1",
            "weights": "[10,40, 50]",
            "weight_unit": "kg",
            "intensity": "-1",
            "rest_duration": "-10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        },
        {
            "id": "7",
            "name": {
                "id": "2",
                "name": "Sprint",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "0",
            "reps": "0",
            "duration": "0.0",
            "duration_unit": "-1",
            "weights": "[100]",
            "weight_unit": "m",
            "intensity": "-1",
            "rest_duration": "-10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        },
    ],
    "title": "First WOD",
    "desc": "This is the first workout",
    "owner_id": "1",
    "owned_by_class": true,
    "scheme_type": "0",
    "scheme_rounds": "[]",
    "media_ids": "[]",
    "date": "2022-08-08T01:49:03.572442Z"
}
// 7 Rounds for time:
const mock_workout_data_1 = {
    "id": "8",
    "workout_items": [
        {
            "id": "5",
            "name": {
                "id": "1",
                "name": "Squat",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "-1",
            "reps": "10",
            "duration": "-0.0",
            "duration_unit": "-1",
            "weights": "[10]",
            "weight_unit": "kg",
            "intensity": "-1",
            "rest_duration": "-10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        },
        {
            "id": "6",
            "name": {
                "id": "2",
                "name": "Bench Press",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "-1",
            "reps": "10",
            "duration": "-0.0",
            "duration_unit": "-1",
            "weights": "[10]",
            "weight_unit": "kg",
            "intensity": "-1",
            "rest_duration": "-10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        },
        {
            "id": "7",
            "name": {
                "id": "2",
                "name": "Sprint",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "-1",
            "reps": "0",
            "duration": "-0.0",
            "duration_unit": "-1",
            "weights": "[100,200,150,250,175,275,300]",
            "weight_unit": "m",
            "intensity": "-1",
            "rest_duration": "-10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        },
    ],
    "title": "Round based workout",
    "desc": "5 rds: 7 Rounds of: etc...",
    "owner_id": "1",
    "owned_by_class": true,
    "scheme_type": "1",
    "scheme_rounds": "[7]",
    "media_ids": "[]",
    "date": "2022-08-08T01:49:03.572442Z"
}
// 21-15-9
const mock_workout_data_2 = {
    "id": "7",
    "workout_items": [
        {
            "id": "5",
            "name": {
                "id": "1",
                "name": "Squat",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "-1",
            "reps": "-1",
            "duration": "-1.0",
            "duration_unit": "-1",
            "weights": "[10]",
            "weight_unit": "kg",
            "intensity": "-1",
            "rest_duration": "10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        }
    ],
    "title": "Workouts like CF girls, 21-15-9, 40-30-20-10",
    "desc": "Rep based workout",
    "owner_id": "1",
    "owned_by_class": true,
    "scheme_type": "2",
    "scheme_rounds": "[21,15,9]",
    "media_ids": "[]",
    "date": "2022-08-08T01:49:03.572442Z"
}

// 20 mins of:
const mock_workout_data_3 = {
    "id": "8",
    "workout_items": [
        {
            "id": "5",
            "name": {
                "id": "1",
                "name": "Squat",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "-1",
            "reps": "10",
            "duration": "-0.0",
            "duration_unit": "-1",
            "weights": "[10]",
            "weight_unit": "kg",
            "intensity": "-1",
            "rest_duration": "-10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        },
        {
            "id": "6",
            "name": {
                "id": "2",
                "name": "Bench Press",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "-1",
            "reps": "10",
            "duration": "-0.0",
            "duration_unit": "-1",
            "weights": "[0.5]",
            "weight_unit": "bw",
            "intensity": "-1",
            "rest_duration": "-10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        },
        {
            "id": "7",
            "name": {
                "id": "2",
                "name": "Sprint",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "-1",
            "reps": "0",
            "duration": "-0.0",
            "duration_unit": "-1",
            "weights": "[100,200,150,250,175,275,300]",
            "weight_unit": "m",
            "intensity": "-1",
            "rest_duration": "-10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        },
        {
            "id": "7",
            "name": {
                "id": "4",
                "name": "Shoulder Press",
                "desc": "",
                "media_ids": "[]",
                "date": "2022-08-08T01:48:50.738421Z"
            },
            "rounds": "-1",
            "sets": "-1",
            "reps": "0",
            "duration": "-0.0",
            "duration_unit": "-1",
            "weights": "[50]",
            "weight_unit": "%",
            "intensity": "-1",
            "rest_duration": "-10.0",
            "rest_duration_unit": "1",
            "date": "2022-08-12T02:24:20.457897Z",
            "workout": "7",
        },
    ],
    "title": "Time based workout",
    "desc": "20 mins for total rounds + reps of Squat w/ 10kg, Bench @ 1/2 of your body weight, Sprints with each rounds increasing in distance, and finally a shoulder press at 50% of your 1RM",
    "owner_id": "1",
    "owned_by_class": true,
    "scheme_type": "3",
    "scheme_rounds": "[20]",
    "media_ids": "[]",
    "date": "2022-08-08T01:49:03.572442Z"
}

const new_workouts = [
    {
        "id": 18,
        "workout_items": [
            {
                "id": 11,
                "name": {
                    "id": 1,
                    "name": "Squat",
                    "desc": "",
                    "media_ids": "[]",
                    "date": "2022-08-08T01:48:50.738421Z"
                },
                "rounds": 0,
                "sets": 3,
                "reps": 5,
                "duration": 0.0,
                "duration_unit": 1,
                "weights": "[70, 75, 80]",
                "weight_unit": "%",
                "intensity": -1,
                "rest_duration": 90,
                "rest_duration_unit": 0,
                "percent_of": "1RM",
                "date": "2022-08-14T03:56:55.547429Z",
                "workout": 18
            },
            {
                "id": 12,
                "name": {
                    "id": 2,
                    "name": "Deadlift",
                    "desc": "",
                    "media_ids": "[]",
                    "date": "2022-08-08T01:48:50.738421Z"
                },
                "rounds": 0,
                "sets": 3,
                "reps": 5,
                "duration": 0.0,
                "duration_unit": -1,
                "weights": "[70, 75, 80]",
                "weight_unit": "%",
                "intensity": -1,
                "rest_duration": 90,
                "rest_duration_unit": 0,
                "percent_of": "1RM",
                "date": "2022-08-14T03:56:55.547429Z",
                "workout": 18
            },
        ],
        "title": "Diablo",
        "desc": "Do this one as fast as possible. Its spicy.",
        "scheme_type": 0,
        "scheme_rounds": "[]",
        "date": "2022-08-14T03:56:41.124507Z",
        "group": {
            "id": 2,
            "owner_id": "1",
            "owned_by_class": false,
            "title": "WorkoutGroup 2 by User",
            "caption": "askdmaklsdmas",
            "media_ids": "[\"0.png\", \"1.png\"]",
            "date": "2022-08-14T03:53:10.105385Z"
        }
    },
    {
        "id": 19,
        "workout_items": [
            {
                "id": 12,
                "name": {
                    "id": 1,
                    "name": "Squat",
                    "desc": "",
                    "media_ids": "[]",
                    "date": "2022-08-08T01:48:50.738421Z"
                },
                "rounds": 5,
                "sets": 0,
                "reps": 0,
                "duration": 10.0,
                "duration_unit": 1,
                "weights": "[10, 20, 30, 40, 50]",
                "weight_unit": "kg",
                "intensity": 0,
                "rest_duration": 45.0,
                "rest_duration_unit": 0,
                "percent_of": "1RM",
                "date": "2022-08-14T03:56:55.547429Z",
                "workout": 18
            },
            {
                "id": 13,
                "name": {
                    "id": 1,
                    "name": "Squat",
                    "desc": "",
                    "media_ids": "[]",
                    "date": "2022-08-08T01:48:50.738421Z"
                },
                "rounds": 1,
                "sets": 2,
                "reps": 5,
                "duration": 0.0,
                "duration_unit": -1,
                "weights": "[10, 20, 30]",
                "weight_unit": "kg",
                "intensity": 0,
                "rest_duration": 10.0,
                "rest_duration_unit": 1,
                "percent_of": "1RM",
                "date": "2022-08-14T03:56:55.547429Z",
                "workout": 18
            },
            {
                "id": 14,
                "name": {
                    "id": 1,
                    "name": "Squat",
                    "desc": "",
                    "media_ids": "[]",
                    "date": "2022-08-08T01:48:50.738421Z"
                },
                "rounds": 1,
                "sets": 2,
                "reps": 5,
                "duration": 0.0,
                "duration_unit": -1,
                "weights": "[10, 20, 30]",
                "weight_unit": "kg",
                "intensity": 0,
                "rest_duration": 10.0,
                "rest_duration_unit": 1,
                "percent_of": "1RM",
                "date": "2022-08-14T03:56:55.547429Z",
                "workout": 18
            },
            {
                "id": 15,
                "name": {
                    "id": 1,
                    "name": "Squat",
                    "desc": "",
                    "media_ids": "[]",
                    "date": "2022-08-08T01:48:50.738421Z"
                },
                "rounds": 1,
                "sets": 2,
                "reps": 5,
                "duration": 0.0,
                "duration_unit": -1,
                "weights": "[10, 20, 30]",
                "weight_unit": "kg",
                "intensity": 0,
                "rest_duration": 10.0,
                "rest_duration_unit": 1,
                "percent_of": "1RM",
                "date": "2022-08-14T03:56:55.547429Z",
                "workout": 18
            },
            {
                "id": 11,
                "name": {
                    "id": 1,
                    "name": "Squat",
                    "desc": "",
                    "media_ids": "[]",
                    "date": "2022-08-08T01:48:50.738421Z"
                },
                "rounds": 1,
                "sets": 2,
                "reps": 5,
                "duration": 0.0,
                "duration_unit": -1,
                "weights": "[10, 20, 30]",
                "weight_unit": "kg",
                "intensity": 0,
                "rest_duration": 10.0,
                "rest_duration_unit": 1,
                "percent_of": "1RM",
                "date": "2022-08-14T03:56:55.547429Z",
                "workout": 18
            },
        ],
        "title": "User Title here",
        "desc": "User workout",
        "scheme_type": 0,
        "scheme_rounds": "[]",
        "date": "2022-08-14T03:56:41.124507Z",
        "group": {
            "id": 2,
            "owner_id": "1",
            "owned_by_class": false,
            "title": "WorkoutGroup 2 by User",
            "caption": "askdmaklsdmas",
            "media_ids": "[\"0.png\", \"1.png\"]",
            "date": "2022-08-14T03:53:10.105385Z"
        }
    },
    {
        "id": 20,
        "workout_items": [
            {
                "id": 11,
                "name": {
                    "id": 1,
                    "name": "Squat",
                    "desc": "",
                    "media_ids": "[]",
                    "date": "2022-08-08T01:48:50.738421Z"
                },
                "rounds": 1,
                "sets": 2,
                "reps": 5,
                "duration": 0.0,
                "duration_unit": -1,
                "weights": "[10, 20, 30]",
                "weight_unit": "kg",
                "intensity": 0,
                "rest_duration": 10.0,
                "rest_duration_unit": 1,
                "percent_of": "1RM",
                "date": "2022-08-14T03:56:55.547429Z",
                "workout": 18
            }
        ],
        "title": "User Title here",
        "desc": "User workout",
        "scheme_type": 0,
        "scheme_rounds": "[]",
        "date": "2022-08-14T03:56:41.124507Z",
        "group": {
            "id": 2,
            "owner_id": "1",
            "owned_by_class": false,
            "title": "WorkoutGroup 2 by User",
            "caption": "askdmaklsdmas",
            "media_ids": "[\"0.png\", \"1.png\"]",
            "date": "2022-08-14T03:53:10.105385Z"
        }
    },
]

const WorkoutInfoSection = styled.ImageBackground`
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
    console.log("WorkoutScreen props: ", params);
    const { id, title, caption, owned_by_class, owner_id, media_ids } = params || {};
    const { data, isLoading, isSuccess, isError, error } = useGetWorkoutGroupClassDataViewQuery(id);
    console.log("Fetch all workouts for Workout Group: ", id, data)


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

    return (
        <WorkoutScreenContainer>

            <Row style={{ flex: 1 }}>
                <RegularText>{title}</RegularText>
            </Row>
            <Row style={{ flex: 11 }}>
                <WorkoutInfoSection source={{ uri: 'https://www.nasa.gov/sites/default/files/thumbnails/image/web_first_images_release.png' }}>
                </WorkoutInfoSection>
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


            <Row style={{ flex: 2 }}>
                <Button onPress={openCreateWorkoutScreenForStandard.bind(this)} title="Add Standard Workout" />
            </Row>
            <Row style={{ flex: 2 }}>
                <Button onPress={openCreateWorkoutScreenForReps.bind(this)} title="Add Reps Workout" />
            </Row>
            <Row style={{ flex: 2 }}>
                <Button onPress={openCreateWorkoutScreenForRounds.bind(this)} title="Add Rounds Workout" />
            </Row>
            <Row style={{ flex: 10 }}>
                {/* // TODO()  Make this a Flat list and render each workout item in sequence not in a flast list*/}
                <View style={{ flex: 1 }}>
                    {
                        isLoading ?
                            <SmallText>Loading....</SmallText>
                            : isSuccess ?

                                <WorkoutGroupWorkoutList data={data.workouts} />



                                : isError ?

                                    <SmallText>Error.... {error.toString()}</SmallText>
                                    :
                                    <SmallText>No Data</SmallText>
                    }
                </View>

            </Row>
        </WorkoutScreenContainer >
    );
};


export default WorkoutScreen;