import React, { FunctionComponent, useEffect, useState } from "react";
import styled from "styled-components/native";
import { Container, MEDIA_CLASSES, SCREEN_HEIGHT, SCREEN_WIDTH, withSpaceURL } from "../app_components/shared";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
// import { withTheme } from 'styled-components'
import { useTheme } from 'styled-components'
import { GymClassCardList } from '../app_components/Cards/cardList'
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { ImageBackground, View } from "react-native";
import { useFavoriteGymMutation, useGetGymDataViewQuery, useGetProfileGymClassFavsQuery, useGetProfileGymFavsQuery, useGetProfileViewQuery, useUnfavoriteGymMutation } from "../redux/api/apiSlice";
import { ScrollView } from "react-native-gesture-handler";
import { IconButton } from "@react-native-material/core";
import { GymCardProps } from "../app_components/Cards/types";
import { filter } from "../utils/algos";
import { Input } from "./input_pages/gyms/CreateWorkoutScreen";
export type Props = StackScreenProps<RootStackParamList, "GymScreen">

import bluish from "./../../assets/bgs/bluish.png"

const GymScreenContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    
    width: 100%;
`;

const GymInfoBG = styled.ImageBackground`
    height: ${SCREEN_HEIGHT * 0.20}px;
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
    const mainURL = withSpaceURL('main', parseInt(id), MEDIA_CLASSES[0])
    const logoURL = withSpaceURL('logo', parseInt(id), MEDIA_CLASSES[0])
    // Fetch GymClasses without workouts to Display here.... by gym ID: id.
    const { data, isLoading, isSuccess, isError, error } = useGetGymDataViewQuery(id);
    console.log("GymData view:", data)

    const {
        data: dataGymFavs,
        isLoading: isLoadingGymFavs,
        isSuccess: isSuccessGymFavs,
        isError: isErrorGymFavs,
        error: errorGymFavs
    } = useGetProfileGymFavsQuery("");

    const [favoriteGymMutation, { isLoading: favGymLoading, }] = useFavoriteGymMutation();
    const [unfavoriteGymMutation, { isLoading: unfavGymLoading }] = useUnfavoriteGymMutation();
    const isFavorited = (gyms: { id: number; user_id: string; date: string; gym: GymCardProps }[]) => {
        let faved = false;
        gyms?.forEach(favgym => {
            if (favgym.gym.id == id) {
                faved = true;
            }
        })
        return faved;
    }
    const favObj = new FormData();
    favObj.append('gym', id)


    const gymClasses = data?.gym_classes || []


    const [stringData, setOgData] = useState<string[]>(gymClasses ? gymClasses.map(gymClass => gymClass.title) : [])
    const [filterResult, setFilterResult] = useState<number[]>(Array.from(Array(stringData.length).keys()).map((idx) => idx))
    useEffect(() => {
        setOgData(gymClasses ? gymClasses.map(gymClass => gymClass.title) : [])
        setFilterResult(Array.from(Array(gymClasses?.length || 0).keys()).map((idx) => idx))
    }, [data])

    // Access/ send actions
    const [term, setTerm] = useState("");
    const filterText = (term: string) => {
        // Updates filtered data.
        const { items, marks } = filter(term, stringData, { word: false })
        setFilterResult(items)
        setTerm(term)
    }


    return (
        <GymScreenContainer>
            <ImageBackground
                source={bluish}
                style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: SCREEN_WIDTH * .0314,
                    height: SCREEN_HEIGHT * 0.0662607,

                }}>
            </ImageBackground>
            <ImageBackground
                source={bluish}
                style={{
                    position: 'absolute',
                    right: 0,
                    left: 0,
                    width: SCREEN_WIDTH * .0314,
                    height: SCREEN_HEIGHT * 0.0662607,

                }}>
            </ImageBackground>

            {/* <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: SCREEN_HEIGHT * 0.08, backgroundColor: 'red' }}>

            </View> */}

            <View style={{
                flexDirection: 'row', alignItems: 'center', alignContent: 'center',
                justifyContent: 'center', width: "100%", height: SCREEN_HEIGHT * 0.0662607,
            }}>

                <View style={{ position: 'absolute', width: '90%', alignItems: 'center', height: '100%' }}>
                    <ScrollView horizontal style={{ marginRight: SCREEN_WIDTH * .0914 }} >
                        <View style={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                            <RegularText textStyles={{ textAlign: 'center', }}>
                                {title} {data?.user_is_owner ? "(Owner)" : data?.user_is_coach ? "(Coach)" : ""}
                            </RegularText>
                        </View>
                    </ScrollView>
                </View>
                <View style={{ position: 'absolute', right: SCREEN_WIDTH * .0314 }}>

                    {
                        dataGymFavs && !isLoadingGymFavs &&
                            isFavorited(dataGymFavs.favorite_gyms) ?
                            <View style={{ alignItems: 'center' }}>
                                <IconButton style={{ height: 24 }} icon={<Icon name='star' color="red" style={{ fontSize: 24 }} />} onPress={() => unfavoriteGymMutation(favObj)} />
                                <SmallText>Unfavorite</SmallText>
                            </View>
                            :
                            <View style={{ alignItems: 'center' }}>
                                <IconButton style={{ height: 24 }} icon={<Icon name='star' color="white" style={{ fontSize: 24 }} />} onPress={() => favoriteGymMutation(favObj)} />
                                <SmallText>Favorite</SmallText>
                            </View>
                    }
                </View>
            </View>



            {/* <View style={{ flex: 1 }}>
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    justifyContent: 'center', width: "100%"
                }}>
                    <View style={{ flex: 1 }}></View>
                    <View style={{ flex: 5 }}>
                        <LargeText textStyles={{ textAlign: 'center' }}>{title}({id})</LargeText>
                    </View>
                    <View style={{ flex: 1 }}>
                        {
                            dataGymFavs && !isLoadingGymFavs &&
                                isFavorited(dataGymFavs.favorite_gyms) ?
                                <IconButton style={{ height: 24 }} icon={<Icon name='star' color="red" style={{ fontSize: 24 }} />} onPress={() => unfavoriteGymMutation(favObj)} />
                                :
                                <IconButton style={{ height: 24 }} icon={<Icon name='star' color="white" style={{ fontSize: 24 }} />} onPress={() => favoriteGymMutation(favObj)} />
                        }
                    </View>
                </View>
            </View> */}

            <View style={{ flex: 2 }}>
                <GymInfoBG source={{ uri: mainURL }}>
                    {/* <RegularText textStyles={{ paddingRight: 12 }}>{title}</RegularText> */}
                    <Row style={{ flex: 1, justifyContent: "flex-end", alignItems: "flex-end" }}>
                        <View style={{ width: '100%', height: '25%', position: 'absolute', bottom: 0, backgroundColor: theme.palette.transparent }}></View>
                        <ScrollView style={{ maxHeight: '50%', width: '55%', marginBottom: 8 }}>
                            <RegularText textStyles={{ flex: 2, paddingLeft: 16, }}>{desc}</RegularText>
                        </ScrollView>
                        <LogoImage
                            source={{ uri: logoURL }}
                            style={{ marginRight: 12, height: SCREEN_HEIGHT * 0.05, marginBottom: 8 }}
                        />

                    </Row>
                </GymInfoBG>



            </View>
            <View style={{ flex: 5 }}>
                <Row style={{ color: "black" }}>
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
                            placeholder="Search classes"
                        />
                    </View>
                </Row>

                {
                    isLoading ?
                        <SmallText>Loading....</SmallText>
                        : isSuccess ?
                            <GymClassCardList data={gymClasses.filter((_, i) => filterResult.indexOf(i) >= 0)} />

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