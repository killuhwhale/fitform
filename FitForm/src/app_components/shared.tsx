import { Dimensions } from "react-native";
import styled from "styled-components/native";
import { SPACES_URL } from "../utils/constants";
export const Container = styled.View`
    flex: 1;
    align-items: center;
    background-color: ${props => props.theme.palette.backgroundColor};
`;



export const SCREEN_WIDTH = Dimensions.get("screen").width;
export const SCREEN_HEIGHT = Dimensions.get("screen").height;

export const INTENSITY_LABELS: Array<string> = ["Low", "Mild", "High", "X-treme"]
export const STANDARD_W = "STANDARD"
export const REPS_W = "REPS"
export const ROUNDS_W = "ROUNDS"
export const DURATION_W = "DURATION"
export const WORKOUT_TYPES: Array<string> = [STANDARD_W, REPS_W, ROUNDS_W, DURATION_W]
export const DURATION_UNITS: Array<string> = ["sec", "mins"]
export const WEIGHT_UNITS: Array<string> = ["kg", "lb", "%"];
export const WEIGHT_UNITS_SET: Set<string> = new Set(["kg", "lb"]);
export const PERCENTAGE_UNITS: Set<string> = new Set(["%"]);
export const BODYWEIGHT_UNITS: Set<string> = new Set(["bw"]);
export const DISTANCE_UNITS_SET: Set<string> = new Set(["m", "yd", "km", "mi", "ft"]);
export const DISTANCE_UNITS: Array<string> = ["m", "yd", "km", "mi"];
export const MEDIA_CLASSES: Array<string> = ["gyms", "classes", "workouts", "names", "users"];



export const withSpaceURL = (url: string, mediaClassID: number, mediaClass: string) => {
    return `${SPACES_URL}/fitform/${mediaClass}/${mediaClassID}/${url}`
}