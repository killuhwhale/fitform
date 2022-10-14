import React, { FunctionComponent, useEffect, useState } from "react";
import styled from "styled-components/native";
import { Container, SCREEN_HEIGHT, SCREEN_WIDTH } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
import { AppBar, IconButton, FAB } from "@react-native-material/core";
import Icon from 'react-native-vector-icons/Ionicons';


// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { GymCardList } from '../app_components/Cards/cardList'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { decrement, increment } from '../redux/slicers/slicer'
import { Button } from "@react-native-material/core";
import { useGetGymsQuery } from "../redux/api/apiSlice";

import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { Input, StrInput } from "./input_pages/gyms/CreateWorkoutScreen";
import { View } from "react-native";
import { GymCardListProps, GymCardProps } from "../app_components/Cards/types";
import WorkoutGroupCard from "../app_components/Cards/WorkoutGroupCard";
import { filter } from "../utils/algos";
export type Props = StackScreenProps<RootStackParamList, "HomePage">

const HomePageContainer = styled(Container)`
    
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    
    width: 100%;
`;


const HomePage: FunctionComponent<Props> = ({ navigation }) => {
    const theme = useTheme();
    // Access value
    const count = useAppSelector((state) => state.counter.value)
    const { data, isLoading, isSuccess, isError, error } = useGetGymsQuery("");
    const dispatch = useAppDispatch();


    const [stringData, setOgData] = useState<string[]>(data ? data.map(gym => gym.title) : [])
    const [filterResult, setFilterResult] = useState<number[]>(Array.from(Array(stringData.length).keys()).map((idx) => idx))
    useEffect(() => {
        setOgData(data ? data.map(gym => gym.title) : [])
        setFilterResult(Array.from(Array(data?.length || 0).keys()).map((idx) => idx))
    }, [data])
    // Access/ send actions
    const [term, setTerm] = useState("");
    const filterText = (term: string) => {
        // Updates filtered data.
        const { items, marks } = filter(term, stringData, { word: false })
        setFilterResult(items)
        setTerm(term)
    }

    console.log("String data", stringData)
    console.log("Filtered results", filterResult)

    return (
        <HomePageContainer>
            {/* <RegularText>Tes {count}</RegularText>
            <Button onPress={() => dispatch(increment())} title={`Increment: ${count}`} /> */}


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
                    placeholder="Search gyms"
                />
            </View>
            {
                isLoading ?
                    <SmallText>Loading....</SmallText>
                    : isSuccess ?
                        <GymCardList data={data.filter((_, i) => filterResult.indexOf(i) >= 0)} />
                        : isError ?

                            <SmallText>Error.... {error.toString()}</SmallText>
                            :
                            <SmallText>No Data</SmallText>
            }

        </HomePageContainer >
    );
};


export default HomePage;