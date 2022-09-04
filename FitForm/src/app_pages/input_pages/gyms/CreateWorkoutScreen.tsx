import React, { FunctionComponent, useState, useContext, useCallback, useRef } from "react";
import { Image, Modal, Platform, StyleSheet, View, Switch } from "react-native";
import { createGlobalStyle, useTheme } from 'styled-components'
import styled from "styled-components/native";
import { AppBar, Button, IconButton, TextInput } from "@react-native-material/core";
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';

import { SmallText, RegularText, LargeText, TitleText } from '../../../app_components/Text/Text'
import { Container, SCREEN_WIDTH, DURATION_UNITS, DISTANCE_UNITS, SCREEN_HEIGHT, WEIGHT_UNITS } from "../../../app_components/shared";
import { useAppSelector, useAppDispatch } from '../../../redux/hooks'
import { useCreateGymClassMutation, useCreateGymMutation, useGetProfileViewQuery, useGetUserGymsQuery, useGetWorkoutNamesQuery } from "../../../redux/api/apiSlice";

import { RootStackParamList } from "../../../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { WorkoutItemProps, WorkoutNameProps } from "../../../app_components/Cards/types";
export type Props = StackScreenProps<RootStackParamList, "CreateWorkoutScreen">

const PageContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    width: 100%;
`;
const Touchable = styled.TouchableHighlight`
    height: 100%;
    border-radius: 25px;
`;


// id: number;
// name: WorkoutNameProps;
// rounds: number;
// sets: number;
// reps: number;
// duration: number;
// duration_unit: number;
// weights: string;
// weight_unit: string;
// intensity: number;
// rest_duration: number;
// rest_duration_unit: number;
// percent_of: string;
// date: string;
// workout: number;

const nanOrNah = (str: string) => {
    return isNaN(parseInt(str)) ? 0 : parseInt(str);
}

const inputStyle = StyleSheet.create({
    input: {
        width: SCREEN_WIDTH / 6,
        padding: 0,
        margin: 0,
        fontSize: 4,
    }
})

const AddItem: FunctionComponent<{ onAddItem(item: WorkoutItemProps): any }> = (props) => {
    const theme = useTheme();
    const [scheme, setScheme] = useState(0);
    const { data, isLoading, isSuccess, isError, error } = useGetWorkoutNamesQuery("");

    const pickerRef = useRef<any>();
    const weightUnitPickRef = useRef<any>();
    const durationUnitPickRef = useRef<any>();
    const restDurationUnitPickRef = useRef<any>();
    const showRepsOrDurationInputRef = useRef<any>();

    const [workoutName, setWorkoutName] = useState(0);

    const [weight, setWeight] = useState("");  // Json string list of numbers.
    const [weightUnit, setWeightUnit] = useState("kg");  // Json string list of numbers.
    const [percentOfWeightUnit, setPercentOfWeightUnit] = useState("");  // Json string list of numbers.

    const [sets, setSets] = useState("0");
    const [reps, setReps] = useState("1");
    const [rounds, setRounds] = useState("0");

    const [duration, setDuration] = useState("0");
    const [durationUnit, setDurationUnit] = useState(0);


    // Figure out what intensity should be. Relative 1-10? Text?
    const [intensity, setIntensity] = useState(0);

    const [restDuration, setRestDuration] = useState("0");
    const [restDurationUnit, setRestDurationUnit] = useState(0);
    const [showReps, setShowReps] = useState(0);


    const RepsOrDurationLabels = ["Reps", "Duration"]

    // This input should vary depedning on the Scheme Type
    // For standard, this will be a single number,
    // For the other types, it should be a single number or match the length of scheme_rounds list
    // Example SchemeType Reps: 21,15,9
    // item Squat weights 200lbs, 100lbs, 50lbs,  ==> this means we do 200 lbs on the first round, 100 on the seocnd, etc...



    const [item, setItem] = useState({
        sets: nanOrNah(sets),
        reps: nanOrNah(reps),
        rounds: nanOrNah(rounds),
        duration: nanOrNah(duration),
        name: data ? data[workoutName] : {} as WorkoutNameProps,
        duration_unit: durationUnit,
        date: "",
        intensity,
        rest_duration: nanOrNah(restDuration),
        rest_duration_unit: restDurationUnit,
        weights: weight,
        weight_unit: weightUnit,
        percent_of: "",
        workout: 0,
        id: 0,
    } as WorkoutItemProps);


    const numFilter = (str: string) => {
        const r = str.replace(/[^0-9]/g, '');
        return r
    }
    const numFilterWithSpaces = (str: string) => {
        const r = str.replace(/[^0-9\s]/g, '');
        return r.trimStart();
    }

    const updateItem = (key, val) => {
        const newItem = item;
        newItem[key] = val
        setItem(newItem);
    }



    const _addItem = () => {
        if (!item.name.name) {
            item.name = data[workoutName]
        }

        console.log("Adding item: ", item)
        props.onAddItem(item)
    }


    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 3, flexDirection: 'row' }}>
                {
                    !isLoading ?
                        <View style={{ justifyContent: 'flex-start', flex: 1 }}>
                            <SmallText>Workout Items</SmallText>
                            <Picker
                                ref={pickerRef}
                                style={{ height: SCREEN_HEIGHT * 0.1, flex: 1 }}
                                itemStyle={{
                                    height: 50,
                                    color: theme.palette.text,
                                    backgroundColor: theme.palette.backgroundColor

                                }}

                                selectedValue={workoutName}
                                onValueChange={(itemValue, itemIndex) => {
                                    setWorkoutName(itemIndex);
                                    updateItem('name', data[itemIndex])
                                }}>
                                {
                                    data.map((name, i) => {
                                        return (
                                            <Picker.Item key={name.id} label={name.name} value={i} />
                                        );
                                    })
                                }
                            </Picker>
                        </View>
                        :
                        <></>
                }
                <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                    <SmallText>Quantity type</SmallText>
                    <Picker
                        ref={showRepsOrDurationInputRef}
                        style={{ height: SCREEN_HEIGHT * 0.1, flex: 1 }}
                        itemStyle={{
                            height: 50,
                            color: theme.palette.text,
                            backgroundColor: theme.palette.backgroundColor

                        }}
                        selectedValue={showReps}
                        onValueChange={(itemValue, itemIndex) => {
                            setShowReps(itemIndex);
                        }}>
                        {
                            RepsOrDurationLabels.map((label, i) => {
                                return (
                                    <Picker.Item key={`show_${label}`} label={label} value={i} />
                                );
                            })
                        }
                    </Picker>
                </View>
            </View>

            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'flex-start', alignContent: 'flex-start', justifyContent: "flex-start", }}>
                {/* <TextInput
                    style={inputStyle.input}
                    onChangeText={(t) => {
                        updateItem('sets', nanOrNah(numFilter(t)))
                        setSets(numFilter(t));
                    }}
                    value={sets}
                    label="Sets"
                /> */}
                {
                    showReps == 0 ?
                        <TextInput
                            style={inputStyle.input}
                            onChangeText={(t) => {
                                updateItem('reps', nanOrNah(numFilter(t)))
                                setReps(numFilter(t))
                            }}
                            value={reps}
                            label="Reps"
                        />
                        :
                        <View style={{ alignContent: 'center', flexDirection: 'row' }}>
                            <TextInput
                                style={inputStyle.input}
                                onChangeText={(t) => {
                                    updateItem('duration', nanOrNah(numFilter(t)))
                                    setDuration(numFilter(t))
                                }}
                                value={duration}
                                label="Duration"
                            />
                            <Picker
                                ref={durationUnitPickRef}
                                style={{ height: SCREEN_HEIGHT * 0.1, flex: 1, justifyContent: 'center' }}
                                itemStyle={{
                                    height: 50,
                                    color: theme.palette.text,
                                    backgroundColor: theme.palette.backgroundColor,
                                    width: SCREEN_WIDTH / 2,

                                }}
                                selectedValue={durationUnit}
                                onValueChange={(itemValue, itemIndex) => {
                                    setDurationUnit(itemIndex);
                                    updateItem('duration_unit', itemIndex)
                                }}>
                                {
                                    DURATION_UNITS.map((unit, i) => {
                                        return (
                                            <Picker.Item key={`rest_${unit}`} label={unit} value={i} />
                                        );
                                    })
                                }
                            </Picker>
                        </View>
                }

                <TextInput
                    style={inputStyle.input}
                    onChangeText={(t) => {
                        updateItem('intensity', nanOrNah(numFilter(t)))
                        setIntensity(parseInt(numFilter(t)))
                    }}
                    value={intensity.toString()}
                    label="Intensity"
                />

                {/* <TextInput
                    style={inputStyle.input}
                    onChangeText={(t) => {
                        updateItem('rounds', nanOrNah(numFilter(t)))
                        setRounds(numFilter(t))
                    }}
                    value={rounds}
                    label="Rounds"
                /> */}
            </View>
            <View style={{ flex: 2, flexDirection: 'row' }}>
                <TextInput
                    style={{ width: SCREEN_WIDTH / 3 }}
                    onChangeText={(t) => {
                        updateItem('weights', numFilterWithSpaces(t))
                        setWeight(numFilterWithSpaces(t))
                    }}
                    value={weight}
                    label="Weight(s)"
                />
                <Picker
                    ref={weightUnitPickRef}
                    style={{ height: SCREEN_HEIGHT * 0.1, flex: 1 }}
                    itemStyle={{
                        height: 50,
                        color: theme.palette.text,
                        backgroundColor: theme.palette.backgroundColor

                    }}
                    selectedValue={weightUnit}
                    onValueChange={(itemValue, itemIndex) => {
                        setWeightUnit(itemValue);
                        updateItem('weight_unit', itemValue)
                    }}>
                    {
                        WEIGHT_UNITS.map((unit, i) => {
                            return (
                                <Picker.Item key={`rest_${unit}`} label={unit} value={unit} />
                            );
                        })
                    }
                </Picker>
                {
                    weightUnit === "%" ?
                        <TextInput
                            style={inputStyle.input}
                            onChangeText={(t) => {
                                updateItem('percent_of', t)
                                setPercentOfWeightUnit(t)
                            }}
                            value={percentOfWeightUnit}
                            label="Percent of"
                        />
                        :
                        <></>
                }



                <TextInput
                    style={inputStyle.input}
                    onChangeText={(t) => {
                        updateItem('rest_duration', nanOrNah(numFilter(t)))
                        setRestDuration(numFilter(t))
                    }}
                    value={restDuration}
                    label="Rest"
                />
                <Picker
                    ref={restDurationUnitPickRef}
                    style={{ height: SCREEN_HEIGHT * 0.1, flex: 1 }}
                    itemStyle={{
                        height: 50,
                        color: theme.palette.text,
                        backgroundColor: theme.palette.backgroundColor
                    }}

                    selectedValue={restDurationUnit}
                    onValueChange={(itemValue, itemIndex) => {
                        setRestDurationUnit(itemIndex);
                        updateItem('rest_duration_unit', itemIndex)
                    }}>
                    {
                        DURATION_UNITS.map((unit, i) => {
                            return (
                                <Picker.Item key={`rest_${unit}`} label={unit} value={i} />
                            );
                        })
                    }
                </Picker>

            </View>
            <View style={{ flex: 2 }} >
                <Button onPress={_addItem.bind(this)} title="Add Item" />
            </View>
        </View>
    );
};

const RepSheme: FunctionComponent<{ onSchemeRoundChange(scheme: string); schemeRounds: string; }> = (props) => {

    return (
        <View>
            <TextInput
                onChangeText={(t) => props.onSchemeRoundChange(t)}
                value={props.schemeRounds}
                label="Reps"
                // helperText={}
                leading={props => <Icon name="checkmark-circle-outline" {...props} />}
            />
        </View>
    );
};


const RoundSheme: FunctionComponent = (props) => {

    return (
        <View>
            <RegularText> Enter Number of rounds or time here 5RFT or 10 Mins of: </RegularText>
        </View>
    );
};
const StandardSheme: FunctionComponent = (props) => {

    return (
        <View>
            <RegularText> Nothing need for a standard list of items....  </RegularText>
        </View>
    );
};







const CreateWorkoutScreen: FunctionComponent<Props> = ({ navigation, route: { params: { workoutGroupID, workoutGroupTitle, schemeType } } }) => {
    const theme = useTheme();


    // Access/ send actions
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [schemeRounds, setSchemeRounds] = useState("");
    const [items, setItems] = useState([] as WorkoutItemProps[])


    console.log("Current workout data:", title, desc, schemeType, schemeRounds)

    const _createGymClass = async () => {
        console.log("Creatting gym class: ", title, desc,)

        // Need to get file from the URI
        const data = new FormData();
        data.append('group', workoutGroupID);
        data.append('title', title);
        data.append('desc', desc);



        console.log("FOrmdata")
        console.log("FOrmdata")
        console.log("FOrmdata")


        try {
            const gymClass = await createGymClass(data).unwrap();
            console.log("Gym class res", gymClass)
            if (gymClass.id) {
                navigation.navigate("HomePageTabs", { screen: "Profile" })
            }

        } catch (err) {
            console.log("Error creating gym", err)
        }
        // TODO possibly dispatch to refresh data
    }

    const openGymPicker = () => {
        if (pickerRef.current) {
            pickerRef.current.focus();
        }
    }
    const closeGymPicker = () => {
        if (pickerRef.current) {
            pickerRef.current.blur();
        }
    }

    const jList = (str: string) => {
        if (!str) {
            return ""
        }
        return JSON.stringify(str.trim().split(" ").map((str: string) => parseInt(str)))
    }

    const addWorkoutItem = (item: WorkoutItemProps) => {
        const _item = { ...item }

        _item.weights = jList(_item.weights)
        console.log("Adding item: ", _item);
        setItems([...items, _item])
    }
    console.log("Current items: ", items)
    return (
        <PageContainer>
            <RegularText>Create workout for {workoutGroupTitle}</RegularText>
            <View style={{ height: '100%', width: '100%' }}>
                <View style={{ flex: 3 }}>
                    <TextInput
                        onChangeText={(t) => setTitle(t)}
                        value={title}
                        label="Title"
                        // helperText={}
                        leading={props => <Icon name="checkmark-circle-outline" {...props} />}
                    />
                    <TextInput
                        label="Description"
                        value={desc}
                        onChangeText={(d) => setDesc(d)}
                        leading={props => <Icon name="checkmark-circle-outline" {...props} />}
                    />
                    {
                        schemeType == 0 ?
                            <>
                                <RegularText>Show Standard Workout here</RegularText>
                            </>
                            : schemeType == 1 ?
                                <>
                                    <SmallText>Rep Scheme</SmallText>
                                    <RepSheme
                                        onSchemeRoundChange={setSchemeRounds.bind(this)}
                                        schemeRounds={schemeRounds}
                                    />
                                </>
                                : schemeType == 2 ?
                                    <>
                                        <RegularText>Show Rounds Workout here</RegularText>
                                    </>
                                    : <></>

                    }

                </View>
                <View style={{ flex: 5 }}>
                    <AddItem
                        onAddItem={addWorkoutItem.bind(this)}
                    />

                </View>
                <View style={{ flex: 2 }}>
                    {
                        items.map(item => {
                            return <SmallText key={`item_test_${Math.random()}`}>
                                {item.duration > 0 ?
                                    `${item.duration} ${DURATION_UNITS[item.duration_unit]} of ` : ''}
                                {item.name.name}
                                {item.weights ? ` x ${item.weights}` : ""}
                                {item.weight_unit === "%" ? ` percent of ${item.percent_of}` : ` ${item.weight_unit}`}
                                {item.intensity > 0 ? ` Intensity: ${item.intensity}` : ""}
                                {item.rest_duration > 0 ? ` Rest: ${item.rest_duration} ${DURATION_UNITS[item.rest_duration_unit]}` : ""}
                            </SmallText>
                        })
                    }
                </View>
                <View style={{ flex: 2 }}>

                    <Button onPress={_createGymClass.bind(this)} title="Create" />

                </View>
            </View>
        </PageContainer>
    );
}

export default CreateWorkoutScreen;