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
const nanOrNah = (str: string) => {
    return isNaN(parseInt(str)) ? 0 : parseInt(str);
}

const numFilter = (str: string) => {
    const r = str.replace(/[^0-9]/g, '');
    return r
}
const numFilterWithSpaces = (str: string) => {
    const r = str.replace(/[^0-9\s]/g, '');
    return r.trimStart();
}

const numberInputStyle = StyleSheet.create({
    containerStyle: {
        width: '100%',
        alignContent: 'center',
        alignItems: 'center',
        height: SCREEN_HEIGHT * .05,
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
        <TouchableWithoutFeedback onPress={() => focus()} style={{ width: '100%', height: '100%' }}>
            <View style={[props.containerStyle]}>
                <SmallText>{props.label}</SmallText>
                <NTextInput
                    style={[{
                        color: theme.palette.text,
                        // backgroundColor: 'red',
                        height: 20,
                        width: '85%',

                    }, props.inputStyles]}
                    selectionColor={theme.palette.text}
                    ref={inpRef}
                    onChangeText={props.onChangeText}
                    value={props.value}
                    placeholder={props.placeholder}

                />
            </View>
        </TouchableWithoutFeedback>
    )
}


const StrInput: FunctionComponent<InputProps> = (props) => {
    const theme = useTheme();
    return (
        <View style={{ flexDirection: "row", backgroundColor: theme.palette.gray, }}>
            <View style={{ justifyContent: 'center', alignContent: 'center', padding: 8, paddingLeft: 12 }}>
                {props.leading}
            </View>
            <View style={{ width: '100%', height: '100%' }}>
                <Input
                    onChangeText={props.onChangeText}
                    label={props.label}
                    containerStyle={[props.containerStyle, {
                        backgroundColor: theme.palette.gray, padding: 6,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                    }]}
                    value={props.value}
                    placeholder={props.placeholder}

                />
            </View>
        </View>
    )
}


const NumberInput: FunctionComponent<InputProps> = (props) => {
    const theme = useTheme();
    return (
        <View style={{ margin: 1, padding: 2, flex: 1, width: '100%' }}>
            <Input
                onChangeText={props.onChangeText}
                label={props.label}
                containerStyle={[props.containerStyle, { backgroundColor: theme.palette.tertiary.main, }]}
                inputStyles={{ textAlign: 'center' }}
                value={props.value}

            />
        </View>
    )
}




const AddItem: FunctionComponent<{ onAddItem(item: WorkoutItemProps): any; schemeType: number; }> = (props) => {

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
    const [reps, setReps] = useState(initReps);
    const [distance, setDistance] = useState(initDistance);
    const [distanceUnit, setDistanceUnit] = useState(initDistanceUnit);

    const [duration, setDuration] = useState(initDuration);
    const [durationUnit, setDurationUnit] = useState(initDurationUnit);

    // Rest should be an item. I can implement something to ensure rest is entered when the WorkoutItem is Rest... 
    const [restDuration, setRestDuration] = useState(initRestDuration);
    const [restDurationUnit, setRestDurationUnit] = useState(initRestDurationUnit);
    const [showQuantity, setShowQuantity] = useState(0);
    const [showRest, setShowRest] = useState(false);
    const QuantityLabels = ["Reps", "Duration", "Distance"]

    // This NumberInput should vary depedning on the Scheme Type
    // For standard, this will be a single number,
    // For the other types, it should be a single number or match the length of scheme_rounds list
    // Example SchemeType Reps: 21,15,9
    // item Squat weights 200lbs, 100lbs, 50lbs,  ==> this means we do 200 lbs on the first round, 100 on the seocnd, etc...

    const defaultItem = {
        sets: nanOrNah(initSets),
        reps: nanOrNah(initReps),
        distance: nanOrNah(initDistance),
        distance_unit: initDistanceUnit,
        ssid: -1,
        duration: nanOrNah(initDuration),
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
        props.onAddItem(item)
        resetDefaultItem()

    }

    console.log("Curren item: ", item.weights)
    return (
        <View style={{ height: SCREEN_HEIGHT * 0.22, borderColor: 'white', borderWidth: 1.5, padding: 2 }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                {
                    !isLoading ?
                        <View style={{ justifyContent: 'flex-start', flex: 3, height: '100%' }}>
                            <SmallText>Workout Items</SmallText>
                            <View style={{ margin: 1, padding: 2, flex: 1, width: '100%' }}>
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
                    <View style={{ margin: 1, padding: 2, flex: 1, width: '100%' }}>
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

            <View style={{ flexDirection: 'row', }}>
                <View style={{ alignContent: 'center', flexDirection: 'row', flex: 1 }}>
                    {
                        props.schemeType == 0 ?
                            <NumberInput
                                containerStyle={numberInputStyle.containerStyle}
                                label="Sets"
                                value={sets}
                                onChangeText={(text: string) => {
                                    updateItem('sets', nanOrNah(numFilter(text)))
                                    setSets(numFilter(text))
                                }}
                            />
                            : <></>
                    }
                </View>

                <View style={{ alignContent: 'center', flexDirection: 'row', flex: 3 }}>
                    {
                        showQuantity == 0 ?
                            <View style={{ flexDirection: 'row', flex: 1 }}>

                                <NumberInput
                                    containerStyle={numberInputStyle.containerStyle}
                                    label="Reps"
                                    value={reps}
                                    onChangeText={(text: string) => {
                                        updateItem('reps', nanOrNah(numFilter(text)))
                                        setReps(numFilter(text))
                                    }}
                                />
                            </View>
                            : showQuantity == 1 ?
                                <View style={{ flexDirection: 'row', width: '100%' }} >
                                    <View style={{ flex: 1 }} >
                                        <NumberInput
                                            containerStyle={numberInputStyle.containerStyle}
                                            onChangeText={(t) => {
                                                updateItem('duration', nanOrNah(numFilter(t)))
                                                setDuration(numFilter(t))
                                            }}
                                            value={duration}
                                            label="Duration"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }} >
                                        <View style={{ margin: 1, padding: 2, flex: 1, width: '100%' }}>
                                            <Picker
                                                ref={durationUnitPickRef}
                                                style={[pickerStyle.containerStyle]}
                                                itemStyle={[pickerStyle.itemStyle, {
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
                                :
                                <View style={{ flexDirection: 'row', width: '100%' }} >
                                    <View style={{ flex: 1 }} >
                                        <NumberInput
                                            containerStyle={numberInputStyle.containerStyle}
                                            label="Distance"
                                            value={distance}
                                            onChangeText={(text: string) => {
                                                updateItem('distance', nanOrNah(numFilter(text)))
                                                setDistance(numFilter(text))
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }} >
                                        <View style={{ margin: 1, padding: 2, flex: 1, width: '100%' }}>
                                            <Picker
                                                ref={distanceUnitPickRef}
                                                style={[pickerStyle.containerStyle]}
                                                itemStyle={[pickerStyle.itemStyle, {
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

                    }
                </View>


                <View style={{ flexDirection: 'row', flex: 3 }}>
                    <View style={{ flex: 2 }}>
                        <NumberInput
                            containerStyle={[numberInputStyle.containerStyle, { width: '100%' }]}
                            onChangeText={(t) => {
                                updateItem('weights', numFilterWithSpaces(t))
                                setWeight(numFilterWithSpaces(t))
                            }}
                            value={weight}
                            label="Weight(s)"
                        />

                    </View>

                    <View style={{ flex: 1 }}>
                        <View style={{ margin: 1, padding: 2, flex: 1, width: '100%' }}>
                            <Picker
                                ref={weightUnitPickRef}
                                style={pickerStyle.containerStyle}

                                itemStyle={[pickerStyle.itemStyle, {
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


            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>


                {
                    weightUnit === "%" ?
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <NumberInput
                                containerStyle={numberInputStyle.containerStyle}
                                onChangeText={(t) => {
                                    updateItem('percent_of', t)
                                    setPercentOfWeightUnit(t)
                                }}
                                value={percentOfWeightUnit}
                                label="% of"
                            />
                        </View>
                        :
                        <></>
                }
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <NumberInput
                            containerStyle={numberInputStyle.containerStyle}
                            onChangeText={(t) => {
                                updateItem('rest_duration', nanOrNah(numFilter(t)))
                                setRestDuration(numFilter(t))
                            }}
                            value={restDuration}
                            label="Rest"
                        />

                    </View>
                    <View style={{ flex: 1 }}>
                        <Picker
                            ref={restDurationUnitPickRef}
                            style={[pickerStyle.containerStyle]}
                            itemStyle={[pickerStyle.itemStyle, {
                                color: theme.palette.text,
                                backgroundColor: theme.palette.backgroundColor,
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

            <View style={{}} >
                <Button onPress={() => _addItem(item)} title="Add Item" />
            </View>
        </View >
    );
};

const RepSheme: FunctionComponent<{ onSchemeRoundChange(scheme: string); schemeRounds: string; }> = (props) => {
    const theme = useTheme();

    return (
        <View>
            <StrInput
                onChangeText={props.onSchemeRoundChange}
                value={props.schemeRounds}
                label="Reps"
                leading={<Icon name="person" color={theme.palette.text} />}
                containerStyle={{

                }}
            />
        </View>
    );
};


const RoundSheme: FunctionComponent<{ onSchemeRoundChange(scheme: string); schemeRounds: string; }> = (props) => {
    const theme = useTheme();
    return (
        <View>
            <StrInput
                onChangeText={props.onSchemeRoundChange}
                value={props.schemeRounds}
                label="Rounds"
                leading={<Icon name="cash" color={theme.palette.text} />}
                containerStyle={{

                }}
            />
        </View>
    );
};

const TimeSheme: FunctionComponent<{ onSchemeRoundChange(scheme: string); schemeRounds: string; }> = (props) => {
    const theme = useTheme();
    return (
        <View>
            <StrInput
                onChangeText={props.onSchemeRoundChange}
                value={props.schemeRounds}
                label="Time (mins)"
                leading={<Icon name="cash" color={theme.palette.text} />}
                containerStyle={{

                }}
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

const COLORSPALETTE = [
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

const displayWeights = (weights: string) => {
    return weights.toString().replace('[', '').replace(']', '')
}



const ItemString: FunctionComponent<{ item: WorkoutItemProps; schemeType: number; }> = ({ item, schemeType }) => {
    const theme = useTheme()
    console.log("ItemStr:", item)
    return (
        <View style={{ width: '100%', borderRadius: 8, marginVertical: 6, padding: 6, }}>
            <SmallText >
                {
                    item.sets > 0 && schemeType === 0 ?
                        `${item.sets} x ${item.reps} `
                        : item.reps > 0 ?
                            `${item.reps} x `
                            : item.distance > 0 ?
                                `${item.distance} ${DISTANCE_UNITS[item.distance_unit]} `
                                : item.duration > 0 ?
                                    `${item.duration} of ${DURATION_UNITS[item.duration_unit]}`
                                    : ""
                }

                {item.name.name}
                {item.weights.length > 0 ? ` @ ${displayWeights(item.weights)}` : ""}
                {item.weights.length === 0 ? "" : item.weight_unit === "%" ? ` percent of ${item.percent_of}` : ` ${item.weight_unit}`}
                {item.rest_duration > 0 ? ` Rest: ${item.rest_duration} ${DURATION_UNITS[item.rest_duration_unit]}` : ""}
            </SmallText>
        </View>
    )
}

const ItemPanel: FunctionComponent<{ item: WorkoutItemProps; schemeType: number; itemWidth: number; idx?: number; }> = ({ item, schemeType, itemWidth, idx }) => {
    const theme = useTheme()

    console.log("Itemstrign item: ", item.sets)
    const navToWorkoutNameDetail = () => {
        console.log("Navigating with props:", item)
        RootNavigation.navigate("WorkoutNameDetailScreen", item.name)
    }
    return (
        <View style={{
            width: itemWidth,
            minWidth: itemWidth,
            height: SCREEN_HEIGHT * 0.15,
            borderRadius: 8,
            marginVertical: 6,
            padding: 6,
            backgroundColor: theme.palette.tertiary.main,
            marginHorizontal: 8,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <View style={{ position: 'absolute', top: 6, left: 6 }}>
                <SmallText>{idx}</SmallText>
            </View>
            <View>
                <SmallText>
                    {item.name.name}
                </SmallText>
            </View>
            <TouchableHighlight
                onPress={navToWorkoutNameDetail}
                style={{ width: itemWidth, }}
                underlayColor={theme.palette.transparent} activeOpacity={0.9}
            >
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <Icon name="menu" color={theme.palette.text} style={{ fontSize: 40 }} />


                </View>
            </TouchableHighlight>
            <View style={{ alignSelf: 'flex-start', paddingLeft: 32 }}>
                <SmallText>
                    {
                        item.sets > 0 && schemeType === 0 ?
                            `${item.sets} x ${item.reps} `
                            : item.reps > 0 ?
                                `${item.reps} reps`
                                : item.distance > 0 ?
                                    `${item.distance} ${DISTANCE_UNITS[item.distance_unit]} `
                                    : item.duration > 0 ?
                                        `${item.duration} ${DURATION_UNITS[item.duration_unit]} of `
                                        : ""
                    }

                </SmallText>

            </View>
            <View style={{ alignSelf: 'flex-start', paddingLeft: 32 }}>
                <SmallText >
                    {item.weights.length > 0 ? `@ ${displayWeights(item.weights)} ${item.weight_unit === "%" ? '' : item.weight_unit}` : ""}
                </SmallText>
                {
                    item.weights.length === 0 ? <></> : item.weight_unit === "%" ?
                        <SmallText >
                            {`Percent of ${item.percent_of}`}
                        </SmallText>
                        :
                        <></>
                }
                <SmallText textStyles={{ alignSelf: 'flex-start' }}>


                    {item.rest_duration > 0 ? `Rest: ${item.rest_duration} ${DURATION_UNITS[item.rest_duration_unit]}` : ""}
                </SmallText>

            </View>


        </View>
    )
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

    const _createWorkoutWithItems = async () => {

        // Need to get file from the URI
        const workoutData = new FormData();
        const data = new FormData();
        workoutData.append('group', workoutGroupID);
        workoutData.append('title', title);
        workoutData.append('desc', desc);
        workoutData.append('scheme_type', schemeType);
        workoutData.append('scheme_rounds', schemeRounds);

        console.log("Creatting workout: ", workoutData)


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


            if (createdItems) {
                navigation.goBack()
            }

        } catch (err) {
            console.log("Error creating gym", err)
        }
        // TODO possibly dispatch to refresh data
    }

    const jList = (str: string) => {
        if (!str) {
            return ""
        }
        return JSON.stringify(str.trim().split(" ").map((str: string) => parseInt(str)))
    }

    const removeItem = (idx) => {
        const _items = [...items]
        _items.splice(idx, 1)
        setItems(_items)
    }

    const addWorkoutItem = (item: WorkoutItemProps) => {
        const _item = { ...item }

        _item.weights = jList(_item.weights)
        console.log("Adding item: ", _item);
        setItems([...items, _item])
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
                <RegularText>{workoutGroupTitle}</RegularText>

            </View>
            <View style={{ height: '100%', width: '100%' }}>
                <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: 5 }}>
                        <StrInput

                            onChangeText={(t) => setTitle(t)}
                            value={title}
                            label="Title"
                            containerStyle={{}}

                            leading={<Icon name="person" color={theme.palette.text} />}
                        />

                    </View>
                    <StrInput
                        label="Description"
                        value={desc}
                        onChangeText={(d) => setDesc(d)}
                        containerStyle={{}}
                        leading={<Icon name="person" color={theme.palette.text} />}
                    />

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
                                            onSchemeRoundChange={(t) => setSchemeRounds(numFilter(t))}
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

                    <Button onPress={_createWorkoutWithItems.bind(this)} title="Create" />

                </View>
            </View>
        </PageContainer>
    );
}

export default CreateWorkoutScreen;
export { ItemString, displayWeights, ItemPanel }