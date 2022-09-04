import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { Container } from "../app_components/shared";
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

const mock_gym_data = [
    {
        id: "1",
        title: "Test Gym",
        desc: "This is a test gym, come workout!",
        owner_id: "1",
        date: "2022-08-08T01:48:45.640081Z",
        mainImage: "gyms/1/main.png",
        logoImage: "gyms/1/logo.png",
    }
]


import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
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
    // Access/ send actions
    const dispatch = useAppDispatch();


    return (
        <HomePageContainer>
            <RegularText>Tes {count}</RegularText>
            <Button onPress={() => dispatch(increment())} title={`Increment: ${count}`} />
            {
                isLoading ?
                    <SmallText>Loading....</SmallText>
                    : isSuccess ?
                        <GymCardList data={data} />
                        : isError ?

                            <SmallText>Error.... {error.toString()}</SmallText>
                            :
                            <SmallText>No Data</SmallText>
            }

        </HomePageContainer >
    );
};


export default HomePage;