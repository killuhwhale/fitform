// Import the RTK Query methods from the React-specific entry point
import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { WorkoutCardProps } from '../../app_components/Cards/types'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASEURL } from '../../utils/constants';

const JWT_ACCESS_TOKEN_KEY = "__jwttoken_access"
const JWT_REFRESH_TOKEN_KEY = "__jwttoken_refresh"

// Dump Asyn Storage
AsyncStorage.getAllKeys((err, keys) => {
    if (keys) {
        AsyncStorage.multiGet(keys, (error, stores) => {
            stores?.map((result, i, store) => {
                console.log("AsyncStorage: ", { [store[i][0]]: store[i][1] });
                return true;
            });
        });
    }
});

export const clearToken = async () => {
    try {
        await AsyncStorage.setItem(JWT_ACCESS_TOKEN_KEY, "")
        await AsyncStorage.setItem(JWT_REFRESH_TOKEN_KEY, "")
        return true;
    } catch (e) {
        // saving error
        console.log("Error clearing from storage: ", e)
        return false;
    }
};
export const storeToken = async (value, access = true) => {
    try {
        if (access) {
            await AsyncStorage.setItem(JWT_ACCESS_TOKEN_KEY, value)
        } else {
            await AsyncStorage.setItem(JWT_REFRESH_TOKEN_KEY, value)
        }
        return true;
    } catch (e) {
        // saving error
        console.log("Errorsaving to storage: ", e)
        return false;
    }

};

export const getToken = async (access = true) => {
    try {
        if (access) {
            return await AsyncStorage.getItem(JWT_ACCESS_TOKEN_KEY)
        } else {
            return await AsyncStorage.getItem(JWT_REFRESH_TOKEN_KEY)

        }

    } catch (e) {
        // error reading value
        console.log("Error getting from storage: ", e)
        return '';
    }

};

// Tag types are good for a global coolection of data....
const cacheTagGym = "gyms"
const cacheTagGymClass = "gymClasses"
const cacheTagWorkouts = "workouts"




const asyncBaseQuery =
    (
        { baseUrl }: { baseUrl: string } = { baseUrl: '' }
    ): BaseQueryFn<{ url: string; method?: string; data?: object; params?: { contentType: string; } }, any, { status: number, data: string; }> =>
        async ({ url, method, data, params }) => {
            try {
                if (!method) {
                    method = "get";
                }
                const contentType = params?.contentType || 'application/json';
                const authToken = await getToken();
                // const authToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjYxMDczNDU5LCJpYXQiOjE2NjA4OTM0NTksImp0aSI6ImQzZTgxMWFkODhlOTQ1MzZiZjk4YTU3MDBmMWU5NDZlIiwidXNlcl9pZCI6MX0.nawTm7dl5JrAw_pFkQQSGOqrIQ--EPRX-xIHKMlhNCg';
                // if (!authToken) {
                //     return {
                //         error: {
                //             status: 403,
                //             data: "Access token is no good",
                //         }
                //     }
                // }
                let options: { method: string; headers: any; body: any; } = {
                    method: method,
                    headers: {
                        contentType: contentType,
                        Authorization: `Bearer ${authToken}`
                    },
                    body: '',
                }
                console.log("ApiSlice")
                console.log("ApiSlice")
                console.log("Data: ", data)
                console.log("url/ method: ", url, method)

                // Remove Authorization header when creating a new account
                if (url === "users/" && method === "POST") {
                    delete options['headers']['Authorization']
                }


                if (data && params?.contentType !== "multipart/form-data") {
                    options.body = JSON.stringify(data);
                } else {
                    console.log("Data added to request body", data)
                    options.body = data;

                }

                const result = await fetch(baseUrl + url, options)
                return { data: result.json() }
            } catch (err: any) {
                return {
                    error: {
                        status: 0,
                        data: err.toString(),
                    },
                }
            }
        }

// Define our single API slice object


export const apiSlice = createApi({
    // The cache reducer expects to be added at `state.api` (already default - this is optional)
    reducerPath: 'api',
    // All of our requests will have URLs starting with '/fakeApi'
    baseQuery: asyncBaseQuery({ baseUrl: BASEURL }),
    tagTypes: [
        'Gyms', 'User', 'GymClasses', 'GymClassWorkoutGroups',
        "UserWorkoutGroups", 'WorkoutGroupWorkouts',

    ],
    // The "endpoints" represent operations and requests for this server
    endpoints: builder => ({
        // The `getPosts` endpoint is a "query" operation that returns data


        // Users, Coaches and Members
        createUser: builder.mutation({
            query: (data = {}) => ({ url: 'users/', method: 'POST', data, params: { contentType: "multipart/form-data" } }),
        }),
        updateUsername: builder.mutation({
            query: (data = {}) => ({ url: 'users/update_username/', method: 'POST', data, params: { contentType: "multipart/form-data" } }),
        }),
        getUsers: builder.query({
            // The URL for the request is '/fakeApi/posts'
            query: () => { return { url: 'users/' } },
        }),
        createCoach: builder.mutation({
            query: (data = {}) => ({ url: 'coaches/', method: 'POST', data, params: { contentType: "multipart/form-data" } }),
        }),
        getCoachesForGymClass: builder.query({
            // The URL for the request is '/fakeApi/posts'
            query: (id) => { return { url: `coaches/${id}/coaches/` } },
        }),
        deleteCoach: builder.mutation({
            query: (data = {}) => ({ url: 'coaches/remove/', method: 'DELETE', data, params: { contentType: "multipart/form-data" } }),
        }),

        createMember: builder.mutation({
            query: (data = {}) => ({ url: 'classMembers/', method: 'POST', data, params: { contentType: "multipart/form-data" } }),
        }),
        getMembersForGymClass: builder.query({
            // The URL for the request is '/fakeApi/posts'
            query: (id) => { return { url: `classMembers/${id}/members/` } },
        }),
        deleteMember: builder.mutation({
            query: (data = {}) => ({ url: 'classMembers/remove/', method: 'DELETE', data, params: { contentType: "multipart/form-data" } }),
        }),


        // Gyms 
        getGyms: builder.query({
            // The URL for the request is '/fakeApi/posts'
            query: () => { return { url: 'gyms/' } },
            providesTags: ['Gyms'],


        }),
        getUserGyms: builder.query({
            // The URL for the request is '/fakeApi/posts'
            query: () => { return { url: 'gyms/user_gyms/' } },
        }),
        createGym: builder.mutation({
            query: (data = {}) => ({ url: 'gyms/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
            invalidatesTags: ['Gyms'],
        }),
        favoriteGym: builder.mutation({
            query: (data) => ({ url: `gyms/favorite/`, method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
        }),
        unfavoriteGym: builder.mutation({
            query: (data) => ({ url: `gyms/unfavorite/`, method: 'DELETE', data, params: { contentType: "multipart/form-data" } }),
        }),
        deleteGym: builder.mutation({
            query: (id) => ({ url: `gyms/${id}/`, method: 'DELETE', data: {}, params: { contentType: "application/json" } }),
        }),
        getGymDataView: builder.query({
            query: (id) => { return { url: `gyms/${id}/gymsclasses/` } },
            providesTags: (result, error, arg) => result?.gym_classes ?
                [...result?.gym_classes.map(({ id }) => ({ type: 'GymClasses', id }))]
                :
                ['GymClasses'],
        }),


        // GymClass
        createGymClass: builder.mutation({
            query: (data = {}) => ({ url: 'gymClasses/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
            invalidatesTags: (result, error, arg) => [{ type: 'GymClasses', id: arg.gym }],
        }),

        getGymClassDataView: builder.query({
            query: (id) => { return { url: `gymClasses/${id}/workouts/` } },
            providesTags: (result, error, arg) => {
                return [{ type: 'GymClassWorkoutGroups', id: result.id }]

            }
        }),


        favoriteGymClass: builder.mutation({
            query: (data) => ({ url: `gymClasses/favorite/`, method: 'POST', data, params: { contentType: "multipart/form-data" } }),
        }),
        unfavoriteGymClass: builder.mutation({
            query: (data) => ({ url: `gymClasses/unfavorite/`, method: 'DELETE', data, params: { contentType: "multipart/form-data" } }),
        }),
        deleteGymClass: builder.mutation({
            query: (id) => ({ url: `gymsClasses/${id}/`, method: 'DELETE', data: {}, params: { contentType: "application/json" } }),
        }),


        // Workouts
        getWorkoutNames: builder.query({
            query: () => { return { url: `workoutNames/`, } }
        }),

        // Workout screen, returns workouts for WorkoutGroup
        // Create workoutItems also needs to invalidate this query
        getWorkoutsForGymClassWorkoutGroup: builder.query({
            query: (id) => { return { url: `workoutGroups/${id}/class_workouts/`, } },
            providesTags: (result, error, arg) => {
                console.log("Providing tags", result, { type: 'WorkoutGroupWorkouts', id: arg })
                return [
                    { type: 'WorkoutGroupWorkouts', id: arg },
                    'UserWorkoutGroups',

                ]
            }
        }),

        // WorkoutScreen
        getWorkoutsForUsersWorkoutGroup: builder.query({
            query: (id) => { return { url: `workoutGroups/${id}/user_workouts/`, } }
        }),
        createWorkoutGroup: builder.mutation({
            query: (data = {}) => ({ url: 'workoutGroups/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
            invalidatesTags: (result, err, arg) => {
                const data = new Map<string, string>(arg._parts)

                console.log("Invaldtes Tag: ", data)
                return data.get('owned_by_class') ?
                    [{ type: 'GymClassWorkoutGroups', id: data.get('owner_id') }] : ['UserWorkoutGroups']
            }


        }),
        finishWorkoutGroup: builder.mutation({
            query: (data = {}) => ({ url: `workoutGroups/finish/`, method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
            invalidatesTags: (result, error, arg) => {
                // inavlidates query for useGetWorkoutsForGymClassWorkoutGroupQuery
                const data = new Map<string, string>(arg._parts)
                console.log("Invalidating WorkoutGroupWorkouts", { type: 'WorkoutGroupWorkouts', id: data.get('group') })
                return [{ type: 'WorkoutGroupWorkouts', id: data.get('group') }]
            }
        }),
        deleteWorkoutGroup: builder.mutation({
            query: (id) => ({ url: `workoutGroups/${id}/`, method: 'DELETE', data: {}, params: { contentType: "application/json" } }),
        }),


        createWorkout: builder.mutation({
            query: (data = {}) => ({ url: 'workouts/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
            invalidatesTags: (result, error, arg) => {
                if (error) return []
                const data = new Map<string, string>(arg._aprts)
                return [{ type: 'WorkoutGroupWorkouts', id: data.get('group') }]

            }
        }),
        deleteWorkout: builder.mutation({
            query: (id) => ({ url: `workouts/${id}/`, method: 'DELETE', data: {}, params: { contentType: "application/json" } }),
        }),


        createWorkoutItems: builder.mutation({
            query: (data = {}) => ({ url: 'workoutItems/items/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
            invalidatesTags: (resut, error, arg) => {
                const data = new Map<string, string>(arg._parts)
                console.log("APISLICECreate workoutItems data: ", data)
                return [{ type: 'WorkoutGroupWorkouts', id: data.get('workout_group') }]
            }
        }),



        // Completed Workouts
        createCompletedWorkout: builder.mutation({
            query: (data = {}) => ({ url: 'completedWorkoutGroups/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
            // IF user completes Class workout, Invalidate both UserWorkoutGroups and  classWorkoutGroups/classID
            // If user complete non class workout, just invaldiate UserWorkoutGroups

            // Should also invalidate WorkoutScreen so that it shows the new completedworkout so user can toggle back and forth.


            // From GymClass -> completed workout screen we get:
            /** 
             * title
             * caption
             * for_date
             * workouts: []
             * workout_group: id
            */
            invalidatesTags: (result, error, arg) => {
                if (error) return []

                const data = new Map<string, string>(arg._parts)
                console.log("Invalidating compelted: ", data, { type: 'WorkoutGroupWorkouts', id: data.get('workout_group') })

                // Cases: 
                // 1. A user completes a WorkoutGroup from a gym Class
                // 2. A user completes a WorkoutGroup from another User. 
                //      - TODO() We do not have a search feature, to find other users workouts yet.
                return [
                    { type: 'WorkoutGroupWorkouts', id: data.get('workout_group') }, // Reset WorkoutScreen
                    'UserWorkoutGroups', // Reset Profile workout list
                    { type: 'GymClassWorkoutGroups', id: data.get('owner_id') }
                ]


            }
        }),
        getCompletedWorkout: builder.query({
            query: (id) => ({ url: `completedWorkoutGroups/${id}/completed_workout_group/` }),
        }),
        getCompletedWorkoutByWorkoutID: builder.query({
            query: (id) => ({ url: `completedWorkoutGroups/${id}/completed_workout_group_by_og_workout_group/` }),
            providesTags: (result, error, arg) => {
                console.log("Providing tagzz", result, { type: 'WorkoutGroupWorkouts', id: arg })
                return [
                    { type: 'WorkoutGroupWorkouts', id: arg },

                ]
            }
        }),
        deleteCompletedWorkoutGroup: builder.mutation({
            query: (id) => ({ url: `completedWorkoutGroups/${id}/`, method: 'DELETE', data: {}, params: { contentType: "application/json" } }),
        }),


        deleteCompletedWorkout: builder.mutation({
            query: (id) => ({ url: `completedWorkouts/${id}/`, method: 'DELETE', data: {}, params: { contentType: "application/json" } }),
        }),


        // User and Profile
        getProfileView: builder.query({
            query: () => { return { url: `profile/profile/`, } }
        }),
        // Expanded Profile data view
        getProfileWorkoutGroups: builder.query({
            query: () => { return { url: `profile/workout_groups/`, } },
            providesTags: ['UserWorkoutGroups']
        }),
        getProfileGymFavs: builder.query({
            query: () => { return { url: `profile/gym_favs/`, } }
        }),
        getProfileGymClassFavs: builder.query({
            query: () => { return { url: `profile/gym_class_favs/`, } }
        }),

        getUserInfo: builder.query({
            query: (id) => { return { url: `users/user_info/`, } }
        }),


        // Stats
        getCompletedWorkoutGroupsForUserByDateRange: builder.query({
            query: (data = {}) => { return { url: `stats/${data.id}/user_workouts/?start_date=${data.startDate}&end_date=${data.endDate}` } }
        }),



    })
})

// Export the auto-generated hook for the `getPosts` query endpoint
export const {
    useCreateUserMutation,
    useUpdateUsernameMutation,
    useCreateCoachMutation,
    useGetCoachesForGymClassQuery,
    useDeleteCoachMutation,

    useCreateMemberMutation,
    useDeleteMemberMutation,
    useGetMembersForGymClassQuery,


    useGetUsersQuery,
    useGetGymsQuery,
    useGetGymDataViewQuery,

    useGetGymClassDataViewQuery,

    useGetUserInfoQuery,
    useGetUserGymsQuery,
    useGetProfileViewQuery,
    useGetProfileWorkoutGroupsQuery,
    useGetProfileGymFavsQuery,
    useGetProfileGymClassFavsQuery,


    useGetWorkoutNamesQuery,

    useGetWorkoutsForGymClassWorkoutGroupQuery,
    useGetWorkoutsForUsersWorkoutGroupQuery,

    useGetCompletedWorkoutQuery,
    useGetCompletedWorkoutByWorkoutIDQuery,
    useDeleteCompletedWorkoutGroupMutation,
    useDeleteCompletedWorkoutMutation,

    useCreateGymMutation,
    useDeleteGymMutation,
    useFavoriteGymMutation,
    useUnfavoriteGymMutation,

    useCreateGymClassMutation,
    useFavoriteGymClassMutation,
    useUnfavoriteGymClassMutation,
    useDeleteGymClassMutation,

    useFinishWorkoutGroupMutation,

    useDeleteWorkoutMutation,
    useCreateWorkoutGroupMutation,
    useDeleteWorkoutGroupMutation,
    useCreateWorkoutMutation,
    useCreateWorkoutItemsMutation,
    useCreateCompletedWorkoutMutation,
    useGetCompletedWorkoutGroupsForUserByDateRangeQuery,
} = apiSlice