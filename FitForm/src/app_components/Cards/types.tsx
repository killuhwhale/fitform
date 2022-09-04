import { ImageSourcePropType } from "react-native";
import { Int32 } from "react-native/Libraries/Types/CodegenTypes";

export interface GymCardProps {
    id: string;
    title: string;
    desc: string;
    owner_id: string;
    date: string;
    mainImage: string;
    logoImage: string;

}
export interface GymCardListProps {
    data: Array<GymCardProps>;
}


export interface GymClassCardProps {
    id: string;
    title: string;
    private: boolean;
    desc: string;
    date: string;
    gym: string;
    mainImage: string;
    logoImage: string;

}
export interface GymClassCardListProps {
    data: Array<GymClassCardProps>;
}



export interface WorkoutNameProps {
    id: number;
    name: string;
    desc: string;
    media_ids: string;
    date: string;
}



export interface WorkoutItemProps {
    id: number;
    name: WorkoutNameProps;
    rounds: number;
    sets: number;
    reps: number;
    duration: number;
    duration_unit: number;
    weights: string;
    weight_unit: string;
    intensity: number;
    rest_duration: number;
    rest_duration_unit: number;
    percent_of: string;
    date: string;
    workout: number;
}

export interface WorkoutItemListProps {
    data: Array<WorkoutItemProps>;
}




export interface WorkoutCardProps {
    id: number;
    workout_items: Array<WorkoutItemProps>;
    title: string;
    desc: string;
    scheme_type: number;
    scheme_rounds: string;
    date: string;

}
export interface WorkoutCardListProps {
    data: Array<WorkoutCardProps>;
}


export interface WorkoutGroupCardProps {
    id: number;
    title: string;
    caption: string;
    owner_id: string;
    owned_by_class: boolean;
    media_ids: string;
    date: string;

}

export interface WorkoutGroupCardListProps {
    data: Array<WorkoutGroupCardProps>;
}

export interface WorkoutGroupProps {
    id: number;
    title: string;
    caption: string;
    owner_id: string;
    owned_by_class: boolean;
    media_ids: string;
    date: string;
    workouts: Array<WorkoutCardProps>;

}




export interface FavoriteGymProps {
    id: number;
    user_id: string;
    gym: GymCardProps;
    date: string;
}

export interface FavoriteGymClassesProps {
    id: number;
    user_id: string;
    gym_class: GymCardProps;
    date: string;
}

export interface BodyMeasurementsProps {
    id: number;
    user_id: string;
    bodyweight: number;
    bodyweight_unit: string;
    bodyfat: number;
    armms: number;
    calves: number;
    neck: number;
    thighs: number;
    chest: number;
    waist: number;
    date: string;
}













