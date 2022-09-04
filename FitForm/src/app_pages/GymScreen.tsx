import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { Container, SCREEN_HEIGHT, SCREEN_WIDTH } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { GymClassCardList } from '../app_components/Cards/cardList'

import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { View } from "react-native";
import { useGetGymDataViewQuery } from "../redux/api/apiSlice";
export type Props = StackScreenProps<RootStackParamList, "GymScreen">


const mock_class_data =
{
    "id": 1,
    "gym_classes": [
        {
            "id": '1',
            "title": "Test Class Two",
            "private": false,
            "desc": "",
            "date": "2022-08-08T01:48:36.173371Z",
            "gym": '1',
            mainImage: '',
            logoImage: '',
        },
        {
            "id": '2',
            "title": "Test Class Two2",
            "private": false,
            "desc": "",
            "date": "2022-08-08T01:48:36.173371Z",
            "gym": '1',
            mainImage: '',
            logoImage: '',
        },
        {
            "id": '3',
            "title": "Test Private Class",
            "private": true,
            "desc": "",
            "date": "2022-08-08T01:48:36.173371Z",
            "gym": '1',
            mainImage: '',
            logoImage: '',
        },
        {
            "id": '4',
            "title": "Test create permissions",
            "private": false,
            "desc": "",
            "date": "2022-08-08T01:48:36.173371Z",
            "gym": '1',
            mainImage: '',
            logoImage: '',
        },
        {
            "id": '7',
            "title": "Class w/ Media",
            "private": false,
            "desc": "This is a general class.",
            "date": "2022-08-08T01:48:36.173371Z",
            "gym": '1',
            mainImage: '',
            logoImage: '',
        }
    ],
    "title": "Test Gym",
    "desc": "This is a test gym, come workout!",
    "owner_id": "1",
    "date": "2022-08-08T01:48:45.640081Z"
}


const GymScreenContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    
    width: 100%;
`;

const GymInfoBG = styled.ImageBackground`
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

const GymScreen: FunctionComponent<Props> = ({ navigation, route: { params } }) => {
    const theme = useTheme();
    const { id, title, desc, logoImage, mainImage } = params || {};
    // Fetch GymClasses without workouts to Display here.... by gym ID: id.
    const { data, isLoading, isSuccess, isError, error } = useGetGymDataViewQuery(id);


    return (
        <GymScreenContainer>
            <View style={{ flex: 2 }}>
                <GymInfoBG source={{ uri: 'https://www.nasa.gov/sites/default/files/thumbnails/image/web_first_images_release.png' }}>
                    <Row style={{ flex: 1, justifyContent: "flex-end", alignItems: "flex-end" }}>
                        <RegularText textStyles={{ paddingRight: 12 }}>{title}</RegularText>
                    </Row>
                </GymInfoBG>

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
                    <SmallText >Classes</SmallText>
                </Row>

                {
                    isLoading ?
                        <SmallText>Loading....</SmallText>
                        : isSuccess ?
                            <GymClassCardList data={data.gym_classes} />

                            : isError ?

                                <SmallText>Error.... {error.toString()}</SmallText>
                                :
                                <SmallText>No Data</SmallText>
                }
            </View>
        </GymScreenContainer >
    );
};


export default GymScreen;