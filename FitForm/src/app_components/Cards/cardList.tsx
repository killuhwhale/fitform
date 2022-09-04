import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { Container } from "../shared";
import { SmallText, RegularText, LargeText, TitleText } from '../Text/Text'
import { useTheme } from 'styled-components'
import { GymCardListProps, GymClassCardListProps, WorkoutGroupCardListProps, WorkoutCardListProps, WorkoutItemListProps, } from "./types";
import GymCard from "./GymCard";
import GymClassCard from "./GymClassCard";
import WorkoutCard from "./WorkoutCard";
import WorkoutItemRow from "./WorkoutItemRow";
import WorkoutRow from "./WorkoutRow";
import WorkoutGroupCard from "./WorkoutGroupCard";

const StyledList = styled.FlatList`
    width:100%;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 15px;
    padding-top: 15px;
`;



const GymCardList: FunctionComponent<GymCardListProps> = (props) => {
    const theme = useTheme();

    return (
        <StyledList
            data={props.data}
            horizontal={false}
            contentContainerStyle={{
                alignItems: "center",
            }}
            keyExtractor={({ id }: any) => id.toString()}
            renderItem={({ item }: any) => <GymCard  {...item} />}
        />
    );
};


const GymClassCardList: FunctionComponent<GymClassCardListProps> = (props) => {
    const theme = useTheme();

    return (
        <StyledList
            data={props.data}
            horizontal={false}
            contentContainerStyle={{
                alignItems: "center",
                justifyContent: "space-between",
            }}
            keyExtractor={({ id }: any) => id.toString()}
            renderItem={({ item }: any) => <GymClassCard  {...item} />}
        />
    );
};

const WorkoutGroupCardList: FunctionComponent<WorkoutGroupCardListProps> = (props) => {
    const theme = useTheme();

    return (
        <StyledList
            data={props.data}
            horizontal={false}
            contentContainerStyle={{
                alignItems: "center",
                justifyContent: "space-between",
            }}
            keyExtractor={({ id }: any) => id.toString()}
            renderItem={({ item }: any) => <WorkoutGroupCard  {...item} />}
        />
    );
};
const WorkoutCardList: FunctionComponent<WorkoutCardListProps> = (props) => {
    const theme = useTheme();

    return (
        <StyledList
            data={props.data}
            horizontal={false}
            contentContainerStyle={{
                alignItems: "center",
                justifyContent: "space-between",
            }}
            keyExtractor={({ id }: any) => id.toString()}
            renderItem={({ item }: any) => <WorkoutCard  {...item} />}
        />
    );
};

const WorkoutGroupWorkoutList: FunctionComponent<WorkoutGroupCardListProps> = (props) => {
    const theme = useTheme();

    return (
        <StyledList
            data={props.data}
            horizontal={false}
            contentContainerStyle={{
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24
            }}
            keyExtractor={({ id }: any) => id.toString()}
            renderItem={({ item }: any) => <WorkoutGroupCard  {...item} />}
        />
    );
};
const WorkoutItemCardList: FunctionComponent<WorkoutItemListProps> = (props) => {
    const theme = useTheme();

    return (
        <StyledList
            data={props.data}
            horizontal={false}
            contentContainerStyle={{
                alignItems: "center",
                justifyContent: "space-between",
            }}
            keyExtractor={({ id }: any) => id.toString()}
            renderItem={({ item }: any) => <WorkoutItemRow  {...item} />}
        />
    );
};


export { GymCardList, GymClassCardList, WorkoutCardList, WorkoutItemCardList, WorkoutGroupCardList, WorkoutGroupWorkoutList };