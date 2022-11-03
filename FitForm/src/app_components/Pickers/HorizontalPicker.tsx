import React, { FunctionComponent, useState } from "react";
import { StyleSheet, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import MaskedView from "@react-native-masked-view/masked-view";
import Animated, {
    useSharedValue,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";

import { SCREEN_WIDTH } from "../shared";
import { SmallText } from "../Text/Text";


{/* https://www.youtube.com/watch?v=PVSjPswRn0U&ab_channel=WilliamCandillon */ }
const HorizontalPicker: FunctionComponent<{ data: string[], onChange(idx: number) }> = (props) => {
    const { data } = props
    const _data = data?.length == 1 ? ['', data[0], ''] : data
    const [xState, setXState] = useState(0);
    const [startPos, setStartPos] = useState(0);
    const [curIdx, setCurIdx] = useState(0)
    const [prevIdx, setPrevIdx] = useState(1)
    const transX = useSharedValue(xState);
    const sharedStartPos = useSharedValue(startPos);
    const sharedCurIdx = useSharedValue(curIdx);
    const sharedPrevIdx = useSharedValue(prevIdx);

    const [itemWidth, setItemWidth] = useState(SCREEN_WIDTH / 3)
    const sharedItemWidth = useSharedValue(itemWidth)
    const [wordSkew, setWordSkew] = useState(0)
    const sharedWordSkew = useSharedValue(wordSkew)
    // iF data cotnains only 1 item, fix it in the middle, dont allow user to change


    const eventHandler = useAnimatedGestureHandler({
        onStart: (event, ctx) => {
            // console.log("On start event: ", event.x, event.y)

        },
        onActive(event, context) {
            // console.log(`Moving from ${transX.value} to ${event.translationX + sharedStartPos.value} by ${event.translationX}`)
            transX.value = event.translationX + sharedStartPos.value
            sharedWordSkew.value = event.translationX + sharedStartPos.value * 4
            setXState(transX.value)
        },
        onEnd: (event, ctx) => {
            const totalDistMoved = event.translationX
            const rawVal = totalDistMoved / sharedItemWidth.value
            const _numItemsTOMove = rawVal > 0 ? -Math.ceil(Math.abs(rawVal)) : Math.ceil(Math.abs(rawVal))
            if (data.length != _data.length) {
                // We have a padded array, do not change index.
                const singeItemArrayIndex = 1
                const moveTo = (singeItemArrayIndex * -sharedItemWidth.value) + sharedItemWidth.value;
                sharedWordSkew.value = 0
                transX.value = moveTo
                setXState(moveTo)
                sharedStartPos.value = moveTo
                setStartPos(moveTo)
                props.onChange(0)
                return
            }
            const numItemsTOMove = Math.max(-data.length - 1, Math.min(data.length - 1, _numItemsTOMove))
            const newIdx = Math.max(0, Math.min(data.length - 1, numItemsTOMove + sharedCurIdx.value))

            // We need to acutally shift this when index is 0 we need to be positive itemWidth
            const moveTo = (newIdx * -sharedItemWidth.value) + sharedItemWidth.value;
            sharedWordSkew.value = 0
            transX.value = moveTo
            setXState(moveTo)
            sharedStartPos.value = moveTo
            setStartPos(moveTo)

            setCurIdx(newIdx)
            setPrevIdx(curIdx)
            sharedPrevIdx.value = sharedCurIdx.value
            sharedCurIdx.value = newIdx

            // Send new selected item
            if (sharedPrevIdx.value != sharedCurIdx.value) {
                // console.log("onchange inside: ", props.onChange)
                props.onChange(newIdx)
            }
        },
    }, [data]);

    const uas = useAnimatedStyle(() => {
        return {
            // left: snapToPoints[Math.floor(transX.value / itemWidth)],
            transform: [{ translateX: withSpring(transX.value) },],
        };
    }, [xState, startPos]);

    const getWidthLayout = (e) => {
        setItemWidth(e.nativeEvent.layout.width / 3)
        sharedItemWidth.value = e.nativeEvent.layout.width / 3
    }

    return (
        <View style={{ flex: 1, width: '100%' }} onLayout={getWidthLayout}>
            <MaskedView style={{ flex: 1, height: '100%', flexDirection: 'row', width: '100%' }} maskElement={
                <Animated.View
                    style={[
                        { flexDirection: 'row', height: '100%', alignItems: 'center' }, uas
                    ]}
                >
                    {
                        _data.map((label, i) => {
                            return (
                                <Animated.View
                                    key={`${label}_${i}`}
                                    style={[
                                        {
                                            width: itemWidth,
                                        },
                                        // uasWordSkew
                                    ]}
                                >
                                    <SmallText textStyles={{ textAlign: 'center' }}>{label}</SmallText>
                                </Animated.View>
                            )
                        })
                    }
                </Animated.View>
            } >
                <View style={{ width: "33%", backgroundColor: "grey" }} />
                <View style={{ width: "33%", backgroundColor: "white" }} />
                <View style={{ width: "33%", backgroundColor: "grey" }} />
            </MaskedView>
            <PanGestureHandler onGestureEvent={eventHandler}>
                <Animated.View style={[StyleSheet.absoluteFill, { flex: 1 }]} />
            </PanGestureHandler>

        </View>


    )
}
export default HorizontalPicker;