let a = {
    "user": {
        "username": "test_admin",
        "email": "c@g.com",
        "id": 1
    },
    "workout_groups": [
        {
            "id": 2,
            "workouts": [
                {
                    "id": 18,
                    "workout_items": [
                        {
                            "id": 11,
                            "name": {
                                "id": 1,
                                "name": "Squat",
                                "desc": "",
                                "media_ids": "[]",
                                "date": "2022-08-08T01:48:50.738421Z"
                            },
                            "rounds": 1,
                            "sets": 2,
                            "reps": 5,
                            "duration": 0.0,
                            "duration_unit": -1,
                            "weights": "[10, 20, 30]",
                            "weight_unit": "kg",
                            "intensity": 0,
                            "rest_duration": 10.0,
                            "rest_duration_unit": 1,
                            "percent_of": "1RM",
                            "date": "2022-08-14T03:56:55.547429Z",
                            "workout": 18
                        }
                    ],
                    "title": "User Title here",
                    "desc": "User workout",
                    "scheme_type": 0,
                    "scheme_rounds": "[]",
                    "date": "2022-08-14T03:56:41.124507Z"
                }
            ],
            "owner_id": "1",
            "owned_by_class": false,
            "title": "WorkoutGroup 2 by User",
            "caption": "askdmaklsdmas",
            "media_ids": "[\"0.png\", \"1.png\"]",
            "date": "2022-08-14T03:53:10.105385Z"
        }
    ],
    "favorite_gyms": [
        {
            "id": 6,
            "gym": {
                "id": 1,
                "title": "Test Gym",
                "desc": "This is a test gym, come workout!",
                "owner_id": "1",
                "date": "2022-08-08T01:48:45.640081Z"
            },
            "user_id": "1",
            "date": "2022-08-08T01:48:43.055768Z"
        }
    ],
    "favorite_gym_classes": [
        {
            "id": 2,
            "gym_class": {
                "id": 1,
                "gym": {
                    "id": 1,
                    "title": "Test Gym",
                    "desc": "This is a test gym, come workout!",
                    "owner_id": "1",
                    "date": "2022-08-08T01:48:45.640081Z"
                },
                "title": "Test Class Two",
                "private": false,
                "desc": "",
                "date": "2022-08-08T01:48:36.173371Z"
            },
            "user_id": "1",
            "date": "2022-08-08T01:48:40.944485Z"
        }
    ],
    "measurements": []
}

import { WorkoutGroupProps, FavoriteGymProps, FavoriteGymClassesProps, BodyMeasurementsProps } from "../app_components/Cards/types";



export interface UserProps {
    username: string;
    email: string;
    id: number;
}

export interface ProfileProps {
    user: UserProps;
    workout_groups: Array<WorkoutGroupProps>;
    favorite_gyms: Array<FavoriteGymProps>;
    favorite_gym_classes: Array<FavoriteGymClassesProps>;
    measurements: BodyMeasurementsProps;

};