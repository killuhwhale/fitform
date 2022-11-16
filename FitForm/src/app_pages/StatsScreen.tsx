import React, { FunctionComponent, useState } from "react";
import { ScrollView, TouchableWithoutFeedback, View } from "react-native";
import styled from "styled-components/native";
import { useTheme } from 'styled-components'
import Icon from 'react-native-vector-icons/Ionicons';
import { Button, IconButton, Switch } from "@react-native-material/core";
import { SmallText, RegularText, LargeText, TitleText } from '../app_components/Text/Text'
import { Container, SCREEN_HEIGHT, SCREEN_WIDTH, processMultiWorkoutStats } from "../app_components/shared";
import { RootStackParamList } from "../navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { WorkoutStats } from "./WorkoutDetailScreen";
import { useGetCompletedWorkoutGroupsForUserByDateRangeQuery } from "../redux/api/apiSlice";
import { WorkoutCardProps, WorkoutGroupProps, WorkoutItemListProps, WorkoutItemProps } from "../app_components/Cards/types";
import DatePicker from 'react-native-date-picker'

import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
} from 'react-native-chart-kit'
import HorizontalPicker from "../app_components/Pickers/HorizontalPicker";
import { ContributionChartValue, TooltipDataAttrs } from "react-native-chart-kit/dist/contribution-graph/ContributionGraph";
import { RectProps } from "react-native-svg/lib/typescript/elements/Rect";
export type Props = StackScreenProps<RootStackParamList, "StatsScreen">


const ScreenContainer = styled(Container)`
    background-color: ${props => props.theme.palette.backgroundColor};
    justify-content: space-between;
    width: 100%;
`;
export const dateFormat = (d: Date) => {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
const shortDateFormat = (d: Date) => {
    return `${d.getMonth() + 1}-${d.getDate()}`
}
const bLineData = (workouts, tagName, metric) => {
    let labels: string[] = []
    let data: number[] = []
    workouts.forEach((workoutStats) => {
        labels.push(shortDateFormat(new Date(workoutStats['date'])))

        if (workoutStats[tagName]) {
            const stat = workoutStats[tagName][metric]
            data.push(stat)
        } else {
            data.push(0)
        }
    })
    // console.log('Line data: ', data)
    return {
        labels,
        datasets: [
            {
                data
            }
        ]
    }
}
const barData = (tags, metric) => {

    const data = Object.keys(tags).map((key) => {
        return parseInt(tags[key][metric])
    })


    return {
        labels: Object.keys(tags),
        datasets: [
            {
                data
            }
        ]
    }
}
const barChartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
};

interface FreqDataProps { date: string; count: number; }

const frequencyData = (workoutGroups: WorkoutGroupProps[]): FreqDataProps[] => {

    if (!workoutGroups) {
        return [{ date: dateFormat(new Date()), count: 0 }]
    }

    const rawData = {}
    workoutGroups.forEach(workoutGroup => {
        let _workouts: WorkoutCardProps[] = []
        if (workoutGroup.workouts?.length) {
            _workouts = workoutGroup.workouts
        }
        if (workoutGroup.completed_workouts?.length) {
            _workouts = workoutGroup.completed_workouts
        }
        const dateVal = dateFormat(new Date(workoutGroup.for_date))
        if (!rawData[dateVal]) {
            rawData[dateVal] = 1
        } else {
            rawData[dateVal] += 1
        }
    })

    return Object.entries(rawData).map(([date, value]) => ({ date, count: value } as FreqDataProps))
}

const StatsScreen: FunctionComponent<Props> = ({ navigation, route: { params } }) => {
    const theme = useTheme();
    const oneday = 1000 * 60 * 60 * 24
    const today = new Date()
    const now = today.getTime()
    const five_days_ago = new Date(now - (oneday * 15))
    const initCalendarText = "Select workout"


    const [startDate, setStartDate] = useState<Date>(five_days_ago);
    const [endDate, setEndDate] = useState<Date>(today);

    const _dayDelta = Math.ceil((endDate.getTime() - startDate.getTime()) / oneday)
    const calendarDayDelta = Math.max(35, _dayDelta)

    const [showTags, setShowTags] = useState(true);
    const maxDataTypes = 9;
    const [showBarChartDataType, setShowBarChartDataType] = useState(0); // Which data to show in the BarChart [totalReps etc...]

    const {
        data,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetCompletedWorkoutGroupsForUserByDateRangeQuery(
        { id: "0", startDate: dateFormat(startDate), endDate: dateFormat(endDate) }
    )



    const [calendarText, setCalendarText] = useState(initCalendarText);


    let allWorkouts: WorkoutCardProps[] = []
    let workoutTagStats: {}[] = []
    let workoutNameStats: {}[] = []
    let tags = {}
    let names = {}
    let tagLabelsSet: Set<string> = new Set()
    let nameLabelsSet: Set<string> = new Set()

    if (data && data.length > 0) {
        data.forEach(workoutGroup => {
            allWorkouts.push(...workoutGroup.completed_workouts)
            const [__tags, __names] = processMultiWorkoutStats(workoutGroup.completed_workouts)



            workoutTagStats.push({ ...__tags, "date": workoutGroup.date })
            workoutNameStats.push({ ...__names, "date": workoutGroup.date })
        })

        const [_tags, _names] = processMultiWorkoutStats(allWorkouts)

        tags = _tags
        names = _names
    }
    Object.keys(tags).forEach(key => tagLabelsSet.add(key))
    Object.keys(names).forEach(key => nameLabelsSet.add(key))

    const tagLabels: string[] = Array.from(tagLabelsSet)
    const nameLabels: string[] = Array.from(nameLabelsSet)

    // console.log("Data: ", workoutTagStats, workoutNameStats)

    const dataTypes = [
        'totalDistanceM',
        'totalKgM',
        'totalKgSec',
        'totalKgs',
        'totalLbM',
        'totalLbSec',
        'totalLbs',
        'totalReps',
        'totalTime',
    ]
    const dataTypeYAxisSuffix = [
        'm',
        'kg*m',
        'kg*sec',
        'kgs',
        'lb*m',
        'lb*sec',
        'lbs',
        'reps',
        'sec',
    ]
    const dataReady = workoutTagStats.length || workoutNameStats.length
    const [showBarLineTags, setShowBarLineTags] = useState(true);
    const [showLineChartDataType, setShowLineChartDataType] = useState(1); // Which data to show in the LineChart [totalReps etc...]
    // Default of 1 is good when we have at least 2 items. but when we have 1 we need it to be 0

    const wrapped = (idx: number) => {
        setShowLineChartDataType(idx)
    }

    const [showLineChartTagType, setShowLineChartTagType] = useState(tagLabels.length == 1 ? 0 : 1); // Which data to show in the LineChart
    const [showLineChartNameType, setShowLineChartNameType] = useState(nameLabels.length == 1 ? 0 : 1); // Which data to show in the LineChart

    const BarData = barData(showTags ? tags : names, dataTypes[showBarChartDataType])
    const BLineData = bLineData(
        showBarLineTags ? workoutTagStats : workoutNameStats,
        showBarLineTags ? tagLabels[showLineChartTagType] : nameLabels[showLineChartNameType],
        dataTypes[showLineChartDataType]
    )
    const freqData = frequencyData(data)

    return (
        <ScreenContainer>
            {/* Date Picker */}
            <View style={{ flex: 1, width: '100%' }}>
                <View style={{
                    flexDirection: 'row',
                    width: '100%',
                    backgroundColor: theme.palette.darkGray,
                    justifyContent: 'center', alignItems: 'center',
                    borderBottomWidth: 2, borderColor: theme.palette.text,
                }}>
                    <SmallText textStyles={{ textAlign: 'center', paddingLeft: 16 }}>Start Date</SmallText>
                    <DatePicker
                        date={startDate}
                        onDateChange={setStartDate}
                        mode='date'
                        locale="en"
                        fadeToColor={theme.palette.darkGray}
                        textColor={theme.palette.text}
                        maximumDate={new Date(new Date().getTime() + oneday)}
                        style={{ height: SCREEN_HEIGHT * 0.06, transform: [{ scale: 0.65, }], }}
                    />
                </View>

                <View style={{
                    flexDirection: 'row',
                    width: '100%',
                    backgroundColor: theme.palette.darkGray,
                    justifyContent: 'center', alignItems: 'center',
                }}>
                    <SmallText textStyles={{ textAlign: 'center', paddingLeft: 16 }}>End Date</SmallText>
                    <DatePicker
                        date={endDate}
                        onDateChange={setEndDate}
                        mode='date'
                        locale="en"
                        fadeToColor={theme.palette.darkGray}
                        textColor={theme.palette.text}
                        style={{ height: SCREEN_HEIGHT * 0.06, transform: [{ scale: 0.65, }] }}
                    />
                </View>
            </View>
            <View style={{ flex: 6 }}>
                <ScrollView>
                    {
                        dataReady ?
                            <>
                                <View style={{ flex: 3, width: '100%', marginBottom: 24, paddingBottom: 12, borderBottomWidth: 1, borderColor: theme.palette.text }}>
                                    <RegularText>{calendarText}</RegularText>
                                    <ScrollView horizontal>
                                        <ContributionGraph
                                            tooltipDataAttrs={(value: ContributionChartValue): (Partial<RectProps> | Partial<RectProps>) => {
                                                return (
                                                    {
                                                        onPress: () => {
                                                            if (value['count'] && value.date) {
                                                                setCalendarText(`${value.date?.toString()}: ${value['count']} workout${value['count'] > 1 ? 's' : ''}`)
                                                            } else {
                                                                setCalendarText(initCalendarText)
                                                            }
                                                        }

                                                    }
                                                )
                                            }}
                                            values={freqData}
                                            endDate={endDate}
                                            // factor = 2/7 or 7/2 == 3.5
                                            numDays={calendarDayDelta}
                                            width={Math.ceil(Math.max(SCREEN_WIDTH * .92, calendarDayDelta * 3.5))}
                                            height={220}
                                            chartConfig={barChartConfig}
                                        />
                                    </ScrollView>
                                </View>

                                <View style={{ flex: 3, width: '100%', marginBottom: 24, paddingBottom: 12, borderBottomWidth: 1, borderColor: theme.palette.text }}>
                                    <View style={{ width: '100%', flexDirection: 'row', }}>
                                        <RegularText>Totals</RegularText>
                                    </View>
                                    <View style={{ width: '100%', flexDirection: 'row', }}>
                                        <IconButton
                                            style={{ height: 24, marginHorizontal: 8 }}
                                            icon={
                                                <Icon name='repeat'
                                                    color={theme.palette.text}
                                                    style={{ fontSize: 24 }}
                                                />
                                            }
                                            onPress={() => { setShowTags(!showTags) }}
                                        />

                                        <HorizontalPicker
                                            key="barChartKey"
                                            data={dataTypes}
                                            onChange={setShowBarChartDataType}
                                        />
                                    </View>

                                    <View style={{ width: '100%', height: 180 }}>
                                        <BarChart
                                            style={{}}
                                            yAxisSuffix=''
                                            data={BarData}
                                            width={SCREEN_WIDTH}
                                            height={180}
                                            yAxisLabel=""
                                            chartConfig={barChartConfig}
                                            verticalLabelRotation={2}
                                            showValuesOnTopOfBars
                                            fromZero
                                        />
                                    </View>
                                </View>


                                <View style={{ flex: 3, width: '100%', marginBottom: 24 }}>
                                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <RegularText>Totals by date</RegularText>
                                        <HorizontalPicker key={`magic${showBarLineTags}`}
                                            data={
                                                showBarLineTags && tagLabels.length > 0 ?
                                                    tagLabels :
                                                    !showBarLineTags && nameLabels.length > 0 ?
                                                        nameLabels : []
                                            }
                                            onChange={
                                                (showBarLineTags && tagLabels.length > 0) ?
                                                    setShowLineChartTagType :
                                                    (!showBarLineTags && nameLabels.length > 0) ?
                                                        setShowLineChartNameType : () => { }}
                                        />
                                    </View>

                                    <View style={{ flex: 1, width: '100%', flexDirection: 'row', }}>
                                        <View style={{ flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                                            <IconButton
                                                style={{ height: 24, marginHorizontal: 8 }}
                                                icon={
                                                    <Icon
                                                        name='repeat'
                                                        color={theme.palette.text}
                                                        style={{ fontSize: 24 }}
                                                    />
                                                }
                                                onPress={() => {
                                                    // When the user changes between the 2 sets of data for the bLine Chart,
                                                    // The horizontal picker resets to to 1, so we need to update the data to reflect the change in the child component.
                                                    setShowBarLineTags(!showBarLineTags)
                                                    setShowLineChartTagType(tagLabels.length == 1 ? 0 : 1)
                                                    setShowLineChartNameType(nameLabels.length == 1 ? 0 : 1)
                                                }} />
                                            <HorizontalPicker
                                                key={`LineChart`}
                                                data={dataTypeYAxisSuffix}
                                                onChange={setShowLineChartDataType}
                                            />
                                        </View>
                                    </View>

                                    <View style={{ width: '100%', height: 180 }}>
                                        <LineChart
                                            data={
                                                BLineData
                                            }
                                            width={SCREEN_WIDTH}
                                            height={180}
                                            verticalLabelRotation={8}
                                            chartConfig={barChartConfig}
                                            bezier
                                            fromZero
                                        />
                                    </View>
                                </View>
                            </>
                            : <></>
                    }
                </ScrollView>
            </View>
        </ScreenContainer>
    )
}

export default StatsScreen;