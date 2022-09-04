import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { Container, SCREEN_HEIGHT, SCREEN_WIDTH } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { WorkoutGroupCardList } from '../app_components/Cards/cardList'

import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { View } from "react-native";
import { useGetGymClassDataViewQuery } from "../redux/api/apiSlice";
export type Props = StackScreenProps<RootStackParamList, "GymClassScreen">


const mock_class_data = {
    "id": 1,
    "workout_groups": [
        {
            "id": 1,
            "owner_id": "1",
            "owned_by_class": true,
            "title": "WorkoutGroup 1",
            "caption": "askdmaklsdmas",
            "media_ids": "[\"0.png\", \"1.png\"]",
            "date": "2022-08-13T23:38:43.017593Z"
        }
    ],
    "title": "Test Class Two",
    "private": false,
    "desc": "",
    "date": "2022-08-08T01:48:36.173371Z",
    "gym": 1
}

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

const GymClassScreen: FunctionComponent<Props> = ({ navigation, route: { params } }) => {
    const theme = useTheme();
    const { id, logoImage, mainImage, title, desc, gym, date, private: is_private } = params || {};
    const { data, isLoading, isSuccess, isError, error } = useGetGymClassDataViewQuery(id);
    return (
        <GymClassScreenContainer>
            <RegularText>Gym Class Screen</RegularText>



            <View style={{ flex: 2 }}>
                <InfoBG source={{ uri: 'https://www.nasa.gov/sites/default/files/thumbnails/image/web_first_images_release.png' }}>
                    <Row style={{ flex: 1, justifyContent: "flex-end", alignItems: "flex-end" }}>
                        <RegularText textStyles={{ paddingRight: 12 }}>{title}</RegularText>
                    </Row>
                </InfoBG>

                <Row style={{ height: SCREEN_HEIGHT * 0.05, flexWrap: "wrap" }}>
                    <SmallText textStyles={{ flex: 2, paddingLeft: 16, }}>{desc} aodnalskndlkasndlknaksl asdklmaskldmas asdklmalksdm aslkmasd alksmdam slkm asdmlmaklsd ams dlka sdlk aslkd mal sdlkma dslk asldk askldm </SmallText>
                    <LogoImage
                        source={{ uri: 'https://www.nasa.gov/sites/default/files/thumbnails/image/web_first_images_release.png' }}
                        style={{ marginRight: 12 }}
                    />
                </Row>

            </View>
            <View style={{ flex: 4 }}>
                <Row style={{ color: "black" }}>
                    <SmallText >Workouts</SmallText>
                </Row>
                {
                    isLoading ?
                        <SmallText>Loading....</SmallText>
                        : isSuccess ?

                            <WorkoutGroupCardList data={data.workout_groups} />

                            : isError ?

                                <SmallText>Error.... {error.toString()}</SmallText>
                                :
                                <SmallText>No Data</SmallText>
                }
            </View>
        </GymClassScreenContainer >
    );
};


export default GymClassScreen;