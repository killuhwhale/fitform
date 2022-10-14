import React, { FunctionComponent, useState, useContext, useCallback, useRef, ReactNode, } from "react";
import {
    Image, Modal, Platform, StyleSheet, View, Switch, ScrollView, TextInput as NTextInput,
    StyleProp, TextStyle, ViewStyle, TextInput as TTextInput, TouchableWithoutFeedback,
} from "react-native";
import { createGlobalStyle, useTheme } from 'styled-components'
import styled from "styled-components/native";
import { Button } from "@react-native-material/core";
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

import { v4 as uuidv4, v1 as tsUUID } from 'uuid';


import { SmallText, RegularText, LargeText, TitleText } from '../../../app_components/Text/Text'
import {
    Container, SCREEN_WIDTH, DURATION_UNITS, DISTANCE_UNITS, SCREEN_HEIGHT,
    WEIGHT_UNITS, WORKOUT_TYPES, STANDARD_W, ROUNDS_W, DURATION_W, REPS_W,
} from "../../../app_components/shared";
import { useAppSelector, useAppDispatch } from '../../../redux/hooks'
import {
    useCreateGymClassMutation, useCreateGymMutation, useGetProfileViewQuery,
    useGetUserGymsQuery, useGetWorkoutNamesQuery, useCreateWorkoutMutation, useCreateWorkoutItemsMutation
} from "../../../redux/api/apiSlice";

import { RootStackParamList } from "../../../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { WorkoutItemProps, WorkoutNameProps } from "../../../app_components/Cards/types";
import { AnimatedButton } from "../../../app_components/Buttons/buttons";
import { TouchableHighlight } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import * as RootNavigation from '../../../navigators/RootNavigation'
import { parseNumList } from "../../WorkoutDetailScreen";
export type Props = StackScreenProps<RootStackParamList, "CreateWorkoutScreen">

const PageContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    width: 100%;
`;



// id: number;
// name: WorkoutNameProps;
// sets: number;
// reps: number;
// duration: number;
// duration_unit: number;
// weights: string;
// weight_unit: string;
// rest_duration: number;
// rest_duration_unit: number;
// percent_of: string;
// date: string;
// workout: number;

// rounds: number;
// intensity: number;
export const nanOrNah = (str: string) => {
    return isNaN(parseInt(str)) ? 0 : parseInt(str);
}

const numFilter = (str: string): string => {
    const r = str.replace(/[^0-9]/g, '');
    return r
}
const numFilterWithSpaces = (str: string): string => {
    const r = str.replace(/[^0-9\s]/g, '');
    const hasSpace = r[r.length - 1] === " "
    return hasSpace ? r.trim() + " " : r.trim();
}

const numberInputStyle = StyleSheet.create({
    containerStyle: {
        width: '100%',
    }
})

const PICKER_WIDTH = SCREEN_WIDTH * 0.25;

const pickerStyle = StyleSheet.create({
    containerStyle: {
    },
    itemStyle: {
        height: SCREEN_HEIGHT * .05,
        textAlign: 'center',
        fontSize: 12,
    }
})


interface InputProps {
    onChangeText(text: string): void | undefined;
    value: string | undefined;
    containerStyle: StyleProp<ViewStyle>;
    label: string;
    placeholder?: string;
    leading?: ReactNode;
    inputStyles?: StyleProp<TextStyle>;
    isError?: boolean;
    helperText?: string;
    editable?: boolean;
    fontSize?: number;
    centerInput?: boolean;
}

interface AddWorkoutItemProps {
    success: boolean;
    errorType: number;
    errorMsg: string;
}


const Input: FunctionComponent<InputProps> = (props) => {
    const theme = useTheme();
    const inpRef = useRef<TTextInput>(null);

    const focus = () => {
        console.log("Focus!")
        if (inpRef.current) {
            inpRef.current.focus()
        }
    }


    return (
        <View style={[props.containerStyle, { width: '100%', flex: 1 }]}>

            <TouchableWithoutFeedback onPress={() => focus()}  >
                <View style={{ width: '100%', }}>
                    <View style={{ flexDirection: 'row', width: '100%', height: '100%' }}>

                        <View style={{ width: props.leading ? '10%' : 0, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            {
                                props.leading ?
                                    props.leading
                                    : <></>
                            }

                        </View>
                        <View
                            style={{
                                width: props.leading ? '80%' : '100%',
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: props.centerInput ? 'center' : 'flex-start'
                            }} >

                            <NTextInput
                                style={
                                    [props.inputStyles,
                                    {
                                        color: theme.palette.text,
                                        width: '100%',
                                        fontSize: props.fontSize || 24,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',

                                    }
                                    ]
                                }

                                ref={inpRef}
                                onChangeText={props.onChangeText}
                                value={props.value}
                                placeholder={props.placeholder}
                                placeholderTextColor={theme.palette.text}
                                selectionColor={theme.palette.text}
                                editable={props.editable == undefined ? true : props.editable}
                            />

                        </View>
                        <View style={{ width: props.leading ? '10%' : 0 }}>

                        </View>
                    </View>
                    {
                        props.isError ?
                            <View style={{ position: 'absolute', left: props.leading ? 40 : 5, bottom: 0 }} >
                                <SmallText textStyles={{ color: 'red' }}>{props.helperText}</SmallText>
                            </View>
                            : <></>
                    }

                </View>

            </TouchableWithoutFeedback>
        </View>
    )
}

// Deprecated
const StrInput: FunctionComponent<InputProps> = (props) => {
    const theme = useTheme();
    return (
        <View style={{ flexDirection: "row", backgroundColor: theme.palette.gray, height: '100%' }}>

            <View style={{ width: '100%' }}>
                <Input
                    onChangeText={props.onChangeText}
                    label={props.label}
                    containerStyle={[props.containerStyle, {
                        padding: 6,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                    }]}
                    value={props.value}
                    placeholder={props.placeholder}
                    editable={props.editable}
                    leading={props.leading}
                    helperText={props.helperText}

                />

            </View>
        </View>
    )
}

// Deprecated
const NumberInput: FunctionComponent<InputProps> = (props) => {
    const theme = useTheme();
    const errorStyles = props.isError ? {
        borderBottomWidth: 2,
        borderColor: 'red',
    } : {}
    return (
        <View style={{ margin: 1, padding: 2, flex: 1, width: '100%' }}>
            <Input
                onChangeText={props.onChangeText}
                label={props.label}
                containerStyle={[props.containerStyle, { backgroundColor: theme.palette.tertiary.main, }, errorStyles]}
                inputStyles={{ textAlign: 'center' }}
                value={props.value}
                editable={props.editable}
            />
            {
                props.isError ?
                    <View style={{ position: 'absolute', bottom: '15%', left: '5%' }} >
                        <SmallText textStyles={{ color: 'red' }}>{props.helperText}</SmallText>
                    </View>
                    : <></>
            }
        </View>
    )
}




const AddItem: FunctionComponent<{ onAddItem(item: WorkoutItemProps): AddWorkoutItemProps; schemeType: number; }> = (props) => {
    const inputFontSize = 14;
    // Needs duration and SSID feature.

    const initWorkoutName = 0;
    const initWeight = "";
    const initWeightUnit = "kg";
    const initPercentOfWeightUnit = "";
    const initSets = "0";
    const initReps = "0";
    const initDistance = "0";
    const initDistanceUnit = 0;

    const initDuration = "0";
    const initDurationUnit = 0;

    const initRestDuration = "0";
    const initRestDurationUnit = 0;


    const theme = useTheme();
    const { data, isLoading, isSuccess, isError, error } = useGetWorkoutNamesQuery("");

    const pickerRef = useRef<any>();
    const weightUnitPickRef = useRef<any>();
    const durationUnitPickRef = useRef<any>();
    const distanceUnitPickRef = useRef<any>();
    const restDurationUnitPickRef = useRef<any>();
    const showRepsOrDurationInputRef = useRef<any>();

    const [workoutName, setWorkoutName] = useState(initWorkoutName);

    const [weight, setWeight] = useState(initWeight);  // Json string list of numbers.
    const [weightUnit, setWeightUnit] = useState(initWeightUnit);  // Json string list of numbers.
    const [percentOfWeightUnit, setPercentOfWeightUnit] = useState(initPercentOfWeightUnit);  // Json string list of numbers.

    const [sets, setSets] = useState(initSets); // Need this for Standard workouts.
    // With schemeType Rounds, allow user to enter space delimited list of numbers that must match number of rounds...
    const [reps, setReps] = useState(initReps);
    const [distance, setDistance] = useState(initDistance);
    const [distanceUnit, setDistanceUnit] = useState(initDistanceUnit);

    const [duration, setDuration] = useState(initDuration);
    const [durationUnit, setDurationUnit] = useState(initDurationUnit);

    // Rest should be an item. I can implement something to ensure rest is entered when the WorkoutItem is Rest... 
    const [restDuration, setRestDuration] = useState(initRestDuration);
    const [restDurationUnit, setRestDurationUnit] = useState(initRestDurationUnit);
    const [showQuantity, setShowQuantity] = useState(0);
    const QuantityLabels = ["Reps", "Duration", "Distance"]


    const [repsSchemeRoundsError, setRepsSchemeRoundsError] = useState(false)
    const [repSchemeRoundsErrorText, setRepsSchemeRoundsErrorText] = useState("")

    // This NumberInput should vary depedning on the Scheme Type
    // For standard, this will be a single number,
    // For the other types, it should be a single number or match the length of scheme_rounds list
    // Example SchemeType Reps: 21,15,9
    // item Squat weights 200lbs, 100lbs, 50lbs,  ==> this means we do 200 lbs on the first round, 100 on the seocnd, etc...

    const defaultItem = {
        sets: nanOrNah(initSets),
        reps: initReps,
        distance: initDistance,
        distance_unit: initDistanceUnit,
        ssid: -1,
        duration: initDuration,
        name: data ? data[initWorkoutName] : {} as WorkoutNameProps,
        duration_unit: initDurationUnit,
        date: "",

        rest_duration: nanOrNah(initRestDuration),
        rest_duration_unit: initRestDurationUnit,
        weights: initWeight,
        weight_unit: initWeightUnit,
        percent_of: initPercentOfWeightUnit,
        workout: 0,
        id: 0,
    } as WorkoutItemProps;

    const [item, setItem] = useState(defaultItem);

    const resetDefaultItem = () => {
        console.log("Resetting item")

        resetItem()
        setWeight(initWeight);
        setDistance(initDistance);

        setPercentOfWeightUnit(initPercentOfWeightUnit);
        setSets(initSets);
        setReps(initReps);

        setDuration(initDuration);

        setRestDuration(initRestDuration);
        setRestDurationUnit(initRestDurationUnit);

    }
    const resetItem = () => {
        setItem({ ...defaultItem, name: data[workoutName] });
    }
    const updateItem = (key, val) => {
        const newItem = item;
        newItem[key] = val
        setItem(newItem);
    }
    const _addItem = (new_item) => {
        if (!item.name.name) {
            item.name = data[workoutName]
        }

        console.log("_Adding item: ", item, new_item)

        // Checks if reps and weights match the repScheme
        const { success, errorType, errorMsg } = props.onAddItem(item)

        if (success) {
            resetDefaultItem()
        }
        else if (errorType == 0) {
            // Missing Reps in Scheme, parent should highlight SchemeRounds Input
            console.log("Add item error: ", errorMsg)
        }
        else if (errorType == 1) {
            // Item reps do not match Reps in Scheme
            console.log("Add item error: ", errorMsg)
            setRepsSchemeRoundsError(true)
            setRepsSchemeRoundsErrorText(errorMsg)
        }

    }

    console.log("Curren item: ", data)

    return (
        <View style={{ height: SCREEN_HEIGHT * 0.28, borderColor: 'white', borderWidth: 1.5, padding: 2 }}>
            <View style={{ flex: 1, flexDirection: 'row', marginBottom: 4 }}>
                {
                    !isLoading && isSuccess && data ?
                        <View style={{ justifyContent: 'flex-start', flex: 3, height: '100%' }}>
                            <SmallText>Workout Items</SmallText>
                            <View style={{ flex: 1, width: '100%' }}>
                                <Picker
                                    ref={pickerRef}
                                    style={{ flex: 1 }}
                                    itemStyle={{
                                        height: "100%",
                                        color: theme.palette.text,
                                        backgroundColor: theme.palette.gray,
                                        fontSize: 16
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
                        </View>
                        :
                        <></>
                }
                <View style={{ flex: 1, }}>
                    <SmallText>Quantity type</SmallText>
                    <View style={{ flex: 1, width: '100%' }}>
                        <Picker
                            ref={showRepsOrDurationInputRef}
                            style={[pickerStyle.containerStyle, { flex: 1 }]}
                            itemStyle={[pickerStyle.itemStyle, {
                                color: theme.palette.text,
                                backgroundColor: theme.palette.gray,
                                height: "100%",
                            }]}
                            selectedValue={showQuantity}
                            onValueChange={(itemValue, itemIndex) => {
                                setDistance(initDistance)
                                setDuration(initDuration)
                                setReps(initReps)
                                // updateItem('distance', nanOrNah(initDistance))
                                // updateItem('duration', nanOrNah(initDuration))
                                // updateItem('reps', nanOrNah(initReps))
                                setShowQuantity(itemIndex);

                            }}>
                            {
                                QuantityLabels.map((label, i) => {
                                    return (
                                        <Picker.Item key={`show_${label}`} label={label} value={i} />
                                    );
                                })
                            }
                        </Picker>
                    </View>
                </View>

            </View>

            <View style={{ flexDirection: 'row', flex: 1, marginBottom: 4 }}>
                {
                    props.schemeType == 0 ?
                        <View style={{ flex: 1 }}>
                            <SmallText textStyles={{ textAlign: 'center', backgroundColor: theme.palette.gray }}>Sets</SmallText>
                            <Input
                                containerStyle={[numberInputStyle.containerStyle, {
                                    backgroundColor: theme.palette.primary.main,
                                    borderRightWidth: 1, borderColor: theme.palette.text,
                                }]}

                                label=""
                                placeholder="Sets"
                                centerInput={true}
                                fontSize={inputFontSize}
                                value={sets}
                                inputStyles={{ textAlign: 'center' }}
                                onChangeText={(text: string) => {
                                    updateItem('sets', nanOrNah(numFilter(text)))
                                    setSets(numFilter(text))
                                }}
                            />
                        </View>
                        : <></>
                }


                <View style={{ alignContent: 'center', flex: 3 }}>
                    {
                        showQuantity == 0 ?
                            <View style={{ flex: 1 }}>
                                <SmallText textStyles={{ textAlign: 'center', backgroundColor: theme.palette.gray }}>Reps</SmallText>
                                <Input
                                    containerStyle={[numberInputStyle.containerStyle, {
                                        backgroundColor: theme.palette.primary.main,
                                        alignItems: 'center', borderRightWidth: 1, borderColor: theme.palette.text,
                                    }]}
                                    label=""
                                    placeholder="Reps"
                                    centerInput
                                    fontSize={inputFontSize}
                                    value={reps}
                                    inputStyles={{ textAlign: 'center' }}
                                    isError={repsSchemeRoundsError}
                                    helperText={repSchemeRoundsErrorText}
                                    onChangeText={(text: string) => {
                                        if (repsSchemeRoundsError) {
                                            setRepsSchemeRoundsError(false)
                                            setRepsSchemeRoundsErrorText('')
                                        }
                                        if (WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                                            WORKOUT_TYPES[props.schemeType] == REPS_W ||
                                            WORKOUT_TYPES[props.schemeType] == DURATION_W
                                        ) {
                                            updateItem('reps', numFilter(text))
                                            setReps(numFilter(text))
                                        } else {
                                            updateItem('reps', numFilterWithSpaces(text))
                                            setReps(numFilterWithSpaces(text))
                                        }

                                    }}
                                />



                            </View>
                            : showQuantity == 1 ?
                                <View style={{ flex: 1 }}>
                                    <SmallText textStyles={{ textAlign: 'center', backgroundColor: theme.palette.gray }}>Duration</SmallText>
                                    <View style={{ flexDirection: 'row', width: '100%', flex: 1 }} >

                                        <View style={{ flex: 1 }} >
                                            <Input
                                                containerStyle={[numberInputStyle.containerStyle, {
                                                    backgroundColor: theme.palette.primary.main,
                                                }]}

                                                label=""
                                                placeholder="Duration"
                                                centerInput={true}
                                                fontSize={inputFontSize}
                                                value={duration}
                                                inputStyles={{ textAlign: 'center' }}
                                                onChangeText={(t) => {


                                                    if (WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                                                        WORKOUT_TYPES[props.schemeType] == REPS_W ||
                                                        WORKOUT_TYPES[props.schemeType] == DURATION_W
                                                    ) {
                                                        updateItem('duration', numFilter(t))
                                                        setDuration(numFilter(t))

                                                    } else {
                                                        updateItem('duration', numFilterWithSpaces(t))
                                                        setDuration(numFilterWithSpaces(t))
                                                    }
                                                }}
                                            />


                                        </View>
                                        <View style={{ flex: 1 }} >
                                            <View style={{ flex: 1, width: '100%' }}>
                                                <Picker
                                                    ref={durationUnitPickRef}
                                                    style={[pickerStyle.containerStyle]}
                                                    itemStyle={[pickerStyle.itemStyle, {
                                                        height: "100%",
                                                        color: theme.palette.text,
                                                        backgroundColor: theme.palette.gray,

                                                    }]}
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
                                        </View>
                                    </View>
                                </View>
                                :
                                <View style={{ flex: 1 }}>
                                    <SmallText textStyles={{ textAlign: 'center', backgroundColor: theme.palette.gray }}>Distance</SmallText>
                                    <View style={{ flexDirection: 'row', width: '100%', flex: 1 }} >
                                        <View style={{ flex: 1 }} >
                                            <Input
                                                containerStyle={[numberInputStyle.containerStyle, {
                                                    backgroundColor: theme.palette.primary.main,
                                                }]}

                                                label=""
                                                placeholder="Distance"
                                                centerInput={true}
                                                fontSize={inputFontSize}
                                                value={distance}
                                                inputStyles={{ textAlign: 'center' }}
                                                onChangeText={(t: string) => {
                                                    if (WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                                                        WORKOUT_TYPES[props.schemeType] == REPS_W ||
                                                        WORKOUT_TYPES[props.schemeType] == DURATION_W
                                                    ) {
                                                        updateItem('distance', numFilter(t))
                                                        setDistance(numFilter(t))

                                                    } else {
                                                        updateItem('distance', numFilterWithSpaces(t))
                                                        setDistance(numFilterWithSpaces(t))
                                                    }
                                                }}
                                            />

                                        </View>
                                        <View style={{ flex: 1 }} >
                                            <View style={{ flex: 1, width: '100%' }}>
                                                <Picker
                                                    ref={distanceUnitPickRef}
                                                    style={[pickerStyle.containerStyle]}
                                                    itemStyle={[pickerStyle.itemStyle, {
                                                        height: "100%",
                                                        color: theme.palette.text,
                                                        backgroundColor: theme.palette.gray,
                                                    }]}
                                                    selectedValue={distanceUnit}
                                                    onValueChange={(itemValue, itemIndex) => {
                                                        setDistanceUnit(itemIndex);
                                                        updateItem('distance_unit', itemIndex)
                                                    }}>
                                                    {
                                                        DISTANCE_UNITS.map((unit, i) => {
                                                            return (
                                                                <Picker.Item key={`rest_${unit}`} label={unit} value={i} />
                                                            );
                                                        })
                                                    }
                                                </Picker>
                                            </View>
                                        </View>
                                    </View>

                                </View>

                    }
                </View>

                <View style={{ flex: 3 }}>
                    <SmallText textStyles={{ textAlign: 'center', backgroundColor: theme.palette.gray }}>Weights</SmallText>
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        <View style={{ flex: 2 }}>
                            <Input
                                containerStyle={[numberInputStyle.containerStyle, {
                                    backgroundColor: theme.palette.primary.main,
                                }]}

                                label=""
                                placeholder="Weight(s)"
                                centerInput={true}
                                fontSize={inputFontSize}
                                value={weight}
                                inputStyles={{ textAlign: 'center' }}
                                onChangeText={(t) => {
                                    if (WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                                        WORKOUT_TYPES[props.schemeType] == REPS_W ||
                                        WORKOUT_TYPES[props.schemeType] == ROUNDS_W
                                    ) {
                                        updateItem('weights', numFilterWithSpaces(t))
                                        setWeight(numFilterWithSpaces(t))
                                    } else {
                                        updateItem('weights', numFilter(t))
                                        setWeight(numFilter(t))
                                    }
                                }}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 1, width: '100%' }}>
                                <Picker
                                    ref={weightUnitPickRef}
                                    style={pickerStyle.containerStyle}

                                    itemStyle={[pickerStyle.itemStyle, {
                                        height: "100%",
                                        color: theme.palette.text,
                                        backgroundColor: theme.palette.gray,
                                    }]}
                                    selectedValue={weightUnit}
                                    onValueChange={(itemValue, itemIndex) => {
                                        setPercentOfWeightUnit(initPercentOfWeightUnit)
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
                            </View>

                        </View>
                    </View>
                </View>
            </View>



            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1, marginBottom: 4 }}>

                {
                    weightUnit === "%" ?


                        <View style={{ flex: 1 }}>
                            <SmallText textStyles={{ textAlign: 'center', backgroundColor: theme.palette.gray }}>% of</SmallText>
                            <Input
                                containerStyle={[numberInputStyle.containerStyle, {
                                    backgroundColor: theme.palette.primary.main,
                                    borderRightWidth: 1, borderColor: theme.palette.text,
                                }]}

                                label=""
                                placeholder="% of"
                                centerInput={true}
                                fontSize={inputFontSize}
                                value={percentOfWeightUnit}
                                inputStyles={{ textAlign: 'center' }}
                                onChangeText={(t) => {
                                    updateItem('percent_of', t)
                                    setPercentOfWeightUnit(t)
                                }}
                            />

                        </View>




                        :
                        <></>
                }

                <View style={{ flex: 1 }}>
                    <SmallText textStyles={{ textAlign: 'center', backgroundColor: theme.palette.gray }}>Rest</SmallText>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Input
                                containerStyle={[numberInputStyle.containerStyle, {
                                    backgroundColor: theme.palette.primary.main,
                                }]}

                                label=""
                                placeholder="Rest"
                                centerInput={true}
                                fontSize={inputFontSize}
                                value={restDuration}
                                inputStyles={{ textAlign: 'center' }}
                                onChangeText={(t) => {
                                    updateItem('rest_duration', nanOrNah(numFilter(t)))
                                    setRestDuration(numFilter(t))
                                }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Picker
                                ref={restDurationUnitPickRef}
                                style={[pickerStyle.containerStyle]}
                                itemStyle={[pickerStyle.itemStyle, {
                                    height: "100%",
                                    color: theme.palette.text,
                                    backgroundColor: theme.palette.gray,
                                }]}

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
                    </View>

                </View>

            </View>

            <View style={{}} >
                <Button onPress={() => _addItem(item)} title="Add Item" style={{ backgroundColor: theme.palette.lightGray }} />
            </View>
        </View >
    );
};

const RepSheme: FunctionComponent<{ onSchemeRoundChange(scheme: string); schemeRounds: string; editable?: boolean; }> = (props) => {
    const theme = useTheme();

    return (
        <View style={{ marginBottom: 15, height: 40, }}>
            <Input
                placeholder="Reps"

                editable={props.editable}
                onChangeText={props.onSchemeRoundChange}
                value={props.schemeRounds}
                label="Reps"

                containerStyle={{
                    width: '100%',
                    backgroundColor: theme.palette.lightGray,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                }}
                leading={<Icon name="person" color={theme.palette.text} style={{ fontSize: 16 }} />}
            />


        </View>
    );
};


const RoundSheme: FunctionComponent<{ onSchemeRoundChange(scheme: string); schemeRounds: string; isError: boolean; editable?: boolean; }> = (props) => {
    const theme = useTheme();
    const errorStyles = props.isError ? {
        borderBottomWidth: 2,
        borderColor: 'red',
    } : {}
    return (
        <View style={{ marginBottom: 15, height: 40, }}>
            <Input
                placeholder="Rounds"
                onChangeText={props.onSchemeRoundChange}
                value={props.schemeRounds}
                label=""
                helperText="Please enter number of rounds"
                isError={props.isError}
                editable={props.editable}
                containerStyle={{
                    width: '100%',
                    backgroundColor: theme.palette.lightGray,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                }}
                leading={<Icon name="person" color={theme.palette.text} style={{ fontSize: 16 }} />}
            />

        </View>
    );
};

const TimeSheme: FunctionComponent<{ onSchemeRoundChange(scheme: string); schemeRounds: string; }> = (props) => {
    const theme = useTheme();
    return (
        <View style={{ marginBottom: 15, height: 40, }}>
            <Input
                placeholder="Time (mins)"
                onChangeText={props.onSchemeRoundChange}
                value={props.schemeRounds}
                label="Time (mins)"
                helperText="Please enter number of rounds"
                containerStyle={{
                    width: '100%',
                    backgroundColor: theme.palette.lightGray,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                }}
                leading={<Icon name="person" color={theme.palette.text} style={{ fontSize: 16 }} />}
            />
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

export const COLORSPALETTE = [
    '#fa4659',
    '#ed93cb',
    '#a3de83',
    '#2eb872',
    '#f469a9',

    '#fd2eb3',
    '#add1fc',
    '#9870fc',

]

const ColorPalette: FunctionComponent<{ onSelect(colorIdx: number); selectedIdx: number; }> = (props) => {
    const boxSize = 16
    const theme = useTheme()
    return (
        <View style={{ width: '100%', height: boxSize, flexDirection: 'row' }}>
            {
                Array.from(Array(8).keys()).map((idx) => {

                    return (
                        <View key={idx} style={{ width: boxSize, height: boxSize, backgroundColor: COLORSPALETTE[idx], margin: 1, }}>
                            <TouchableWithoutFeedback
                                style={{ width: '100%', height: '100%', margin: 1, }}
                                onPress={() => props.onSelect(idx)}

                            >
                                <View style={
                                    [
                                        {
                                            width: boxSize, height: boxSize,
                                            backgroundColor: COLORSPALETTE[idx],

                                        }, props.selectedIdx === idx ? {
                                            borderWidth: 3,
                                            borderColor: theme.palette.text,

                                        } : {}]}>

                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    )
                })
            }
        </View >
    )
}

const displayJList = (weights: string) => {
    return weights.toString().replace('[', '').replace(']', '')
}

// Converts list of num to stringified list
const jList = (str: string): string => {
    const S = str.trim()
    if (!S) {
        return JSON.stringify([])
    }
    return JSON.stringify(S.split(" ").map((strnum: string) => parseInt(strnum)))
}


const ItemString: FunctionComponent<{ item: WorkoutItemProps; schemeType: number; }> = ({ item, schemeType }) => {
    const theme = useTheme()
    // console.log('Item str: ', item, item.reps == '[0]')



    return (
        <View style={{ width: '100%', borderRadius: 8, marginVertical: 6, padding: 6, }}>
            <SmallText >

                {
                    item.sets > 0 && schemeType === 0 ?
                        `${item.sets} x ` : ''
                }

                {
                    item.reps !== '[0]' ?
                        `${displayJList(item.reps)}  `
                        : item.distance !== '[0]' ?
                            `${displayJList(item.distance)} ${DISTANCE_UNITS[item.distance_unit]} `
                            : item.duration !== '[0]' ?
                                `${displayJList(item.duration)} ${DURATION_UNITS[item.duration_unit]} of `
                                : ""
                }

                {item.name.name}
                {item.weights.length > 0 ? ` @ ${displayJList(item.weights)}` : ""}
                {item.weights.length === 0 ? "" : item.weight_unit === "%" ? ` percent of ${item.percent_of}` : ` ${item.weight_unit}`}
                {item.rest_duration > 0 ? ` Rest: ${item.rest_duration} ${DURATION_UNITS[item.rest_duration_unit]}` : ""}
            </SmallText>
        </View>
    )
}

const ItemPanel: FunctionComponent<{ item: WorkoutItemProps; schemeType: number; itemWidth: number; idx?: number; }> = ({ item, schemeType, itemWidth, idx }) => {
    const theme = useTheme()

    const navToWorkoutNameDetail = () => {
        console.log("Navigating with props:", item)
        RootNavigation.navigate("WorkoutNameDetailScreen", item.name)
    }
    const itemReps = item.reps == '' || item.reps == '0' ? "0" : item.reps
    const itemDistance = item.distance == '' || item.distance == '0' ? "0" : item.distance
    const itemDuration = item.duration == '' || item.duration == '0' ? "0" : item.duration
    return (
        <View style={{
            width: itemWidth,
            minWidth: itemWidth,
            height: SCREEN_HEIGHT * 0.15,
            borderRadius: 8,
            marginVertical: 6,
            padding: 6,
            backgroundColor: theme.palette.primary.main,
            marginHorizontal: 8,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <View style={{ position: 'absolute', top: 6, left: 6, flex: 1 }}>
                <SmallText>{idx}</SmallText>
            </View>
            <View style={{ flex: 1 }}>
                <SmallText>
                    {item.name.name} ({item.id})
                </SmallText>
            </View>
            <View style={{ flex: 4, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableHighlight
                    onPress={navToWorkoutNameDetail}
                    style={{ width: '100%', }}
                    underlayColor={theme.palette.transparent} activeOpacity={0.9}
                >
                    <View style={{ width: '100%', }}>
                        <Icon name="menu"
                            color={

                                schemeType == 0 && item.ssid >= 0 ?
                                    COLORSPALETTE[item.ssid]
                                    : theme.palette.text

                            }
                            style={{ fontSize: 40 }}
                        />
                        {
                            schemeType == 0 && item.ssid >= 0 ?
                                <SmallText textStyles={{ color: COLORSPALETTE[item.ssid], textAlign: 'center' }}>SS</SmallText>
                                : <></>
                        }
                    </View>
                </TouchableHighlight>
            </View>
            <View style={{ alignSelf: 'center', flex: 2, width: '100%', justifyContent: 'center' }}>
                <SmallText textStyles={{ textAlign: 'center' }}>
                    {
                        item.sets > 0 && schemeType === 0 ?
                            `${item.sets} x ` : ''
                    }

                    {
                        item.reps !== '[0]' ?
                            `${displayJList(item.reps)}  `
                            : item.distance !== '[0]' ?
                                `${displayJList(item.distance)} ${DISTANCE_UNITS[item.distance_unit]} `
                                : item.duration !== '[0]' ?
                                    `${displayJList(item.duration)} ${DURATION_UNITS[item.duration_unit]}`
                                    : ""
                    }


                </SmallText>

            </View>
            <View style={{ alignItems: 'center', flex: 2, width: '100%' }}>
                {
                    item.weights.length > 0 ?
                        <SmallText >
                            {`@ ${displayJList(item.weights)} ${item.weight_unit === "%" ? '' : item.weight_unit}`}
                        </SmallText>
                        : <></>
                }
                {
                    item.weights.length === 0 ? <></> : item.weight_unit === "%" ?
                        <SmallText >
                            {`Percent of ${item.percent_of}`}
                        </SmallText>
                        :
                        <></>
                }
                <SmallText textStyles={{ alignSelf: 'center' }}>


                    {item.rest_duration > 0 ? `Rest: ${item.rest_duration} ${DURATION_UNITS[item.rest_duration_unit]}` : ""}
                </SmallText>

            </View>


        </View>
    )
}


const verifyWorkoutItem = (_item: WorkoutItemProps, schemeType: number, schemeRounds: string): { success: boolean; errorType: number; errorMsg: string; } => {
    // For standard workouts: weights must match sets per item...
    // Reps are single and weights are multiple
    if (WORKOUT_TYPES[schemeType] == STANDARD_W) {
        const itemSets = _item.sets
        const weightList = parseNumList(_item.weights)
        if (weightList.length > 1 && itemSets != weightList.length) {
            return { success: false, errorType: 3, errorMsg: 'Weights must match sets' }
        }
    }

    // For reps based workout,  weights must match repScheme, repscheme must be entered.
    // Reps are single and weights are multiple
    else if (WORKOUT_TYPES[schemeType] == REPS_W) {
        const weightList = parseNumList(_item.weights)
        console.log("Edit item verify: ", weightList)
        if (parseNumList(schemeRounds).length < 1) {
            return { success: false, errorType: 0, errorMsg: 'Please add number of reps per round' }
        }

        if (weightList.length > 1 && weightList.length !== parseNumList(schemeRounds).length) {
            return { success: false, errorType: 2, errorMsg: 'Weights must match repscheme' }

        }
    }

    // For rounds based workout, reps and weights must match repScheme
    // Reps and weights are multiple nums
    else if (WORKOUT_TYPES[schemeType] == ROUNDS_W) {
        // If scheme rounds have not been entered....
        console.log("Current shcemeRounds ", schemeRounds)
        if (schemeRounds.length == 0) {

            return { success: false, errorType: 0, errorMsg: 'Please add number of rounds' }
        }

        // IF item does not match number of rounds
        // Ensure reps is 1 number of matches the number of roungs
        // Eg 5 Rounds => Reps [1] or [5,5,3,3,1] (different sets for each round)

        console.log("Bad item reps? ", _item.reps)
        const itemRepsList = parseNumList(_item.reps)
        const itemWeightsList = parseNumList(_item.weights)

        if (itemRepsList.length > 1 && itemRepsList.length !== parseInt(schemeRounds)) {
            console.log("Dont add item!", itemRepsList, schemeRounds)
            return { success: false, errorType: 1, errorMsg: 'Match rounds' }
        }
        if (itemWeightsList.length > 1 && itemWeightsList.length !== parseInt(schemeRounds)) {
            console.log("Dont add item!", itemWeightsList, schemeRounds)
            return { success: false, errorType: 1, errorMsg: 'Match rounds' }
        }
    }
    // For Time Based workouts, reps and weights should just be single, no check required.
    // Reps and weights are single
    return { success: true, errorType: -1, errorMsg: '' }
}

const CreateWorkoutScreen: FunctionComponent<Props> = ({
    navigation, route: { params: { workoutGroupID, workoutGroupTitle, schemeType } }
}) => {
    const theme = useTheme();


    // Access/ send actions
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [schemeRounds, setSchemeRounds] = useState("");
    const [items, setItems] = useState([] as WorkoutItemProps[])
    const [showAddSSID, setShowAddSSID] = useState(false);
    const [curColor, setCurColor] = useState(-1);
    const [createWorkout, { isLoading: workoutIsLoading }] = useCreateWorkoutMutation();
    const [createWorkoutItem, { isLoading: workoutItemIsLoading }] = useCreateWorkoutItemsMutation();

    const [schemeRoundsError, setSchemeRoundsError] = useState(false)


    const _createWorkoutWithItems = async () => {

        // Need to get file from the URI
        const workoutData = new FormData();
        const data = new FormData();
        workoutData.append('group', workoutGroupID);
        workoutData.append('title', title);
        workoutData.append('desc', desc);
        workoutData.append('scheme_type', schemeType);
        workoutData.append('scheme_rounds', schemeRounds);

        console.log("Creatting workout with Group ID and Data: ", workoutGroupID, workoutData)


        try {

            const createdWorkout = await createWorkout(workoutData).unwrap();
            console.log("Workout res", createdWorkout)

            items.forEach((item, idx) => {
                item.order = idx
                item.workout = createdWorkout.id

            })
            data.append('items', JSON.stringify(items));
            data.append('workout', createdWorkout.id)
            const createdItems = await createWorkoutItem(data).unwrap();
            console.log("Workout item res", createdItems)

            // TODO handle errors 
            if (createdItems) {
                navigation.goBack()
            }

        } catch (err) {
            console.log("Error creating gym", err)
        }
        // TODO possibly dispatch to refresh data
    }




    const removeItem = (idx) => {
        const _items = [...items]
        _items.splice(idx, 1)
        setItems(_items)
    }

    const addWorkoutItem = (item: WorkoutItemProps): AddWorkoutItemProps => {
        const _item = { ...item }

        const { success, errorType, errorMsg } = verifyWorkoutItem(_item, schemeType, schemeRounds)

        if (!success && errorType === 0) {
            setSchemeRoundsError(true)
            return { success, errorType, errorMsg }
        }
        if (schemeRoundsError) {
            setSchemeRoundsError(false)
        }

        _item.weights = jList(_item.weights)
        _item.reps = jList(_item.reps)
        _item.duration = jList(_item.duration)
        _item.distance = jList(_item.distance)

        console.log("Adding item: ", _item);
        setItems([...items, _item])
        return { success: true, errorType: -1, errorMsg: '' }
    }

    const removeItemSSID = (idx) => {
        console.log('Removing idx: ', idx)
        const newItems = [...items];
        const newItem = newItems[idx];
        newItem.ssid = -1
        newItems[idx] = newItem
        setItems(newItems)
    }

    const addItemToSSID = (idx) => {
        const newItems = [...items];

        const newItem = newItems[idx];
        if (newItem.ssid == -1) {
            newItem.ssid = curColor;
            console.log(newItem.ssid)
            newItems[idx] = newItem
            setItems(newItems)
        }
    }



    return (
        <PageContainer>
            <View style={{ margin: 5 }}>
                <RegularText>{workoutGroupTitle} ({workoutGroupID})</RegularText>

            </View>

            <View style={{ height: '100%', width: '100%' }}>
                <View style={{ marginBottom: 15, height: 40, }}>
                    <Input
                        onChangeText={(t) => setTitle(t)}
                        value={title}
                        label=""
                        placeholder="Title"
                        containerStyle={{
                            width: '100%',
                            backgroundColor: theme.palette.lightGray,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                        }}
                        leading={<Icon name="person" color={theme.palette.text} style={{ fontSize: 16 }} />}
                    />
                </View>

                <View style={{ marginBottom: 5, height: 40 }}>
                    <Input
                        label=""
                        placeholder="Description"
                        value={desc}
                        onChangeText={(d) => setDesc(d)}
                        containerStyle={{
                            width: '100%',
                            backgroundColor: theme.palette.lightGray,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                        }}
                        leading={<Icon name="person" color={theme.palette.text} style={{ fontSize: 16 }} />}
                    />

                </View>
                <View>
                    {
                        WORKOUT_TYPES[schemeType] == STANDARD_W ?
                            <>

                            </>
                            : WORKOUT_TYPES[schemeType] == REPS_W ?
                                <>
                                    <SmallText>Rep Scheme</SmallText>
                                    <RepSheme
                                        onSchemeRoundChange={(t) => setSchemeRounds(numFilterWithSpaces(t))}
                                        schemeRounds={schemeRounds}
                                    />
                                </>
                                : WORKOUT_TYPES[schemeType] == ROUNDS_W ?
                                    <>
                                        <SmallText>Number of Rounds</SmallText>
                                        <RoundSheme
                                            onSchemeRoundChange={
                                                (t) => {
                                                    // Reset
                                                    if (schemeRoundsError) {
                                                        setSchemeRoundsError(false)
                                                    }
                                                    setSchemeRounds(numFilter(t))
                                                }
                                            }
                                            editable={items.length === 0}
                                            isError={schemeRoundsError}
                                            schemeRounds={schemeRounds}
                                        />
                                    </>
                                    : WORKOUT_TYPES[schemeType] == DURATION_W ?
                                        <>
                                            <SmallText>Duration of workout</SmallText>
                                            <TimeSheme
                                                onSchemeRoundChange={(t) => setSchemeRounds(numFilter(t))}
                                                schemeRounds={schemeRounds}
                                            />
                                        </>
                                        : <></>

                    }

                </View>
                <AddItem
                    onAddItem={addWorkoutItem}
                    schemeType={schemeType}
                />

                <View style={{ flex: schemeType == 0 ? 2 : 1 }}>
                    {
                        schemeType == 0 ?
                            <View>
                                <SmallText>Add Superset</SmallText>
                                <Switch
                                    value={showAddSSID}
                                    onValueChange={(v) => {
                                        setShowAddSSID(v)
                                        if (!v) { setCurColor(-1) }
                                    }}

                                    trackColor={{ true: theme.palette.primary.contrastText, false: theme.palette.lightGray }}
                                    thumbColor={showAddSSID ? theme.palette.primary.main : theme.palette.gray}
                                />
                            </View>
                            : <></>
                    }

                    {
                        showAddSSID ?
                            <View>
                                <ColorPalette
                                    onSelect={setCurColor}
                                    selectedIdx={curColor}
                                />
                                <ScrollView>
                                    {
                                        items.map((item, idx) => {
                                            return (

                                                <View key={`item_test_${Math.random()}`}
                                                    style={{ height: SCREEN_HEIGHT * 0.05, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                                                >
                                                    <View style={{ flex: 10 }}>
                                                        <ItemString item={item} schemeType={schemeType} />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <TouchableWithoutFeedback
                                                            onPress={() => {

                                                                item.ssid >= 0 ?
                                                                    removeItemSSID(idx)
                                                                    : curColor > -1 ?
                                                                        addItemToSSID(idx)
                                                                        : console.log("Select a color first!")
                                                            }}
                                                        >
                                                            <Icon name="person"
                                                                color={
                                                                    item.ssid >= 0 ?
                                                                        COLORSPALETTE[item.ssid] : theme.palette.text
                                                                }

                                                            />
                                                        </TouchableWithoutFeedback>

                                                    </View>


                                                </View>

                                            )

                                        })
                                    }

                                </ScrollView>
                            </View>
                            :
                            <ScrollView>
                                {
                                    items.map((item, idx) => {
                                        return (
                                            <AnimatedButton
                                                title={item.name.name}
                                                style={{ width: '100%' }}
                                                onFinish={() => removeItem(idx)}
                                                key={`itemz_${idx}_${Math.random()}`}
                                            >
                                                <View style={{
                                                    height: SCREEN_HEIGHT * 0.05,
                                                    flexDirection: 'row', alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }} >
                                                    <View style={{ flex: 10 }}>
                                                        <ItemString item={item} schemeType={schemeType} />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Icon name="person"
                                                            color={
                                                                item.ssid >= 0 ?
                                                                    COLORSPALETTE[item.ssid] : theme.palette.text
                                                            }

                                                        />

                                                    </View>
                                                </View>
                                            </AnimatedButton>
                                        )

                                    })
                                }

                            </ScrollView>

                    }
                </View>
                <View style={{ flex: 1 }}>

                    <Button onPress={_createWorkoutWithItems.bind(this)} title="Create" style={{ backgroundColor: theme.palette.lightGray }} />

                </View>
            </View>
        </PageContainer>
    );
}

export default CreateWorkoutScreen;
export {
    ItemString, ItemPanel, StrInput, NumberInput, numberInputStyle, Input,
    numFilter, numFilterWithSpaces, displayJList, jList, verifyWorkoutItem,
}

