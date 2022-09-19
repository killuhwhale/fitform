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
                console.log("ApiSlice")
                console.log("ApiSlice")
                console.log("ApiSlice")
                console.log("contentType: ", contentType)




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
    // The "endpoints" represent operations and requests for this server
    endpoints: builder => ({
        // The `getPosts` endpoint is a "query" operation that returns data
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



        getGyms: builder.query({
            // The URL for the request is '/fakeApi/posts'
            query: () => { return { url: 'gyms/' } },
        }),
        getUserGyms: builder.query({
            // The URL for the request is '/fakeApi/posts'
            query: () => { return { url: 'gyms/user_gyms/' } },
        }),
        createGym: builder.mutation({
            query: (data = {}) => ({ url: 'gyms/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
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
        }),


        createGymClass: builder.mutation({
            query: (data = {}) => ({ url: 'gymClasses/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
        }),
        getGymClassDataView: builder.query({
            query: (id) => { return { url: `gymClasses/${id}/workouts/` } },
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



        getWorkoutNames: builder.query({
            query: () => { return { url: `workoutNames/`, } }
        }),


        getWorkoutsForGymClassWorkoutGroup: builder.query({
            query: (id) => { return { url: `workoutGroups/${id}/class_workouts/`, } }
        }),
        getWorkoutsForUsersWorkoutGroups: builder.query({
            query: (id) => { return { url: `workoutGroups/user_workouts/`, } }
        }),
        createWorkoutGroup: builder.mutation({
            query: (data = {}) => ({ url: 'workoutGroups/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
        }),
        deleteWorkoutGroup: builder.mutation({
            query: (id) => ({ url: `workoutGroups/${id}/`, method: 'DELETE', data: {}, params: { contentType: "application/json" } }),
        }),


        getWorkoutForWorkoutGroup: builder.query({
            query: (id) => { return { url: `workout/${id}/class_workouts/`, } }
        }),

        createWorkout: builder.mutation({
            query: (data = {}) => ({ url: 'workouts/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
        }),
        deleteWorkout: builder.mutation({
            query: (id) => ({ url: `workouts/${id}/`, method: 'DELETE', data: {}, params: { contentType: "application/json" } }),
        }),
        getWorkoutItemsForWorkout: builder.query({
            query: (id) => { return { url: `workoutGroups/${id}/class_workouts/`, } }
        }),
        createWorkoutItems: builder.mutation({
            query: (data = {}) => ({ url: 'workoutItems/items/', method: 'POST', data: data, params: { contentType: "multipart/form-data" } }),
        }),

        getProfileView: builder.query({
            query: () => { return { url: `profile/profile/`, } }
        }),

        getUserInfo: builder.query({
            query: (id) => { return { url: `users/user_info/`, } }
        }),



    })
})

// Export the auto-generated hook for the `getPosts` query endpoint
export const {
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


    useGetWorkoutNamesQuery,
    useGetWorkoutsForGymClassWorkoutGroupQuery,
    useGetWorkoutsForUsersWorkoutGroupsQuery,


    useCreateGymMutation,
    useDeleteGymMutation,
    useFavoriteGymMutation,
    useUnfavoriteGymMutation,

    useCreateGymClassMutation,
    useFavoriteGymClassMutation,
    useUnfavoriteGymClassMutation,
    useDeleteGymClassMutation,

    useDeleteWorkoutMutation,
    useCreateWorkoutGroupMutation,
    useDeleteWorkoutGroupMutation,
    useCreateWorkoutMutation,
    useCreateWorkoutItemsMutation,
} = apiSlice