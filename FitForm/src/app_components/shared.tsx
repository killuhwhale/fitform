import { Dimensions } from "react-native";
import styled from "styled-components/native";

export const Container = styled.View`
    flex: 1;
    align-items: center;
    background-color: ${props => props.theme.palette.backgroundColor};
`;



export const SCREEN_WIDTH = Dimensions.get("screen").width;
export const SCREEN_HEIGHT = Dimensions.get("screen").height;

export const INTENSITY_LABELS: Array<string> = ["Low", "Mild", "High", "X-treme"]
export const DURATION_UNITS: Array<string> = ["sec", "mins"]
export const WEIGHT_UNITS: Array<string> = ["kg", "lb", "%"];
export const WEIGHT_UNITS_SET: Set<string> = new Set(["kg", "lb"]);
export const PERCENTAGE_UNITS: Set<string> = new Set(["%"]);
export const BODYWEIGHT_UNITS: Set<string> = new Set(["bw"]);
export const DISTANCE_UNITS: Set<string> = new Set(["m", "yd", "km", "mi", "ft"]);