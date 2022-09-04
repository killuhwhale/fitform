import React, { FunctionComponent, useRef } from "react";
import styled from "styled-components/native";
import { Container, SCREEN_HEIGHT, SCREEN_WIDTH } from "../shared";
import { SmallText, RegularText, LargeText, TitleText } from '../Text/Text'
import { useTheme } from 'styled-components'
import { ImageOrVideo } from "react-native-image-crop-picker";
import { Image, View } from "react-native";
import Video from 'react-native-video';

const MAX_MEDIA_ITEMS = 7;

const StyledList = styled.FlatList`
    width:100%;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 15px;
    padding-top: 15px;
`;

const onBuffer = () => {
    console.log("On Buffer")
}
const onError = () => {
    console.log("On Error")
}

interface MediaSliderProps {
    data: ImageOrVideo[] | undefined;

}


interface MediaItemProps {
    file: ImageOrVideo;
}

const MediaItem: FunctionComponent<ImageOrVideo> = (props) => {
    const fileRefs = useRef<any>([]);
    console.log("Item props", props)
    return (
        <View style={{ paddingRight: 20 }}>
            {
                props.mime.split("/")[0] == "video" ?
                    // <RegularText>{props.filename}</RegularText>
                    <Video source={{ uri: props.path }}
                        ref={(ref) => {
                            fileRefs.current[fileRefs.current.length] = ref
                        }}
                        repeat={true}
                        paused={false}
                        onBuffer={onBuffer.bind(this)}
                        onError={onError.bind(this)}
                        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} />
                    :
                    <Image source={{ uri: props.path }}
                        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, resizeMode: 'contain' }} />

            }
        </View>

    );
}


const MediaSlider: FunctionComponent<MediaSliderProps> = (props) => {
    console.log("Screen Width: ", SCREEN_WIDTH)
    const screen_margin = 8;
    return (
        props.data != undefined ?
            <StyledList
                data={props.data.slice(0, MAX_MEDIA_ITEMS)}
                horizontal={true}
                contentContainerStyle={{
                    alignItems: "center",

                }}
                decelerationRate={"fast"}
                snapToAlignment="center"
                snapToInterval={SCREEN_WIDTH + (2 * screen_margin)}

                keyExtractor={({ localIdentifier }: any) => localIdentifier}
                renderItem={({ item }: any) => <MediaItem  {...item} />}
            />
            :
            <RegularText> No Media </RegularText>
    );
}

export { MediaSlider, }; 