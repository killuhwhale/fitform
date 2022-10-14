


brew install node
brew install watchman

sudo gem install cocoapods
sudo arch -x86_64 gem install ffi
arch -x86_64 pod install

When deleteing build folder or using new simulator, needed to remove DervivedData
rm -r /Users/chrisandaya/Library/Developer/Xcode/DerivedData     

env /usr/bin/arch -arm64 /bin/bash --login

npx react-native start     
npx react-native run-ios

npx react-native run-ios --udid CCF49CB5-3952-4D51-8830-27A2BA1FEB1B

import { GymCardProps } from "../app_components/Cards/types"
import { get, post } from "../utils/fetchAPI"

const LIST_GYMS = "http://localhost:8000/gyms/";




I have a login, and am storing tokens.

TODOs

    HUGE:

    - DONT ALLOW user to complete their own workout
        - Check on backend when creating a Completed Workout,
            - WorkoutGroup ownerid != user_id
        - Front end: dont show button in that case.


    - Need a mechanism to signal that workouts are done being added to the Workout Group.
        - I want to avoid editing workouts after they are made.
        - I want to delete and redo if the user needs to edit the workout
        - add field to WorkoutGroups -> finished
        - WHen not finished, show user the button to add workouts.
        - Dont allow user to remove workouts when finished.
        - Show confirmation dialog, informing of this feature.
            - Once workout is finialized, no edits are allowed.
            - Must delete and re-create to edit
    

    - Allow user to add a date to workoutGroup
        - Workout Group
            - dayRx => the day the workout was intended to be completed on
        - Completed Workout Group
            - dayCompleted => the day the workout was completed on
        

        The issue is:
        If a user wants to add a multiple workoiuts on a single day, currently it will look like the user completed these when the WG was created.
        So we need to add a field to the 2 models in order to know when the workoutGroup is supposed to be done, or when the completed workout group was completed....



    Auth:
        - Add user registration
        - Handle expired access tokens in Middleware

    Home:
        - Filter gyms
        - Filter classes
        - Filter workout groups

    Cleanup:
        - GymClassScreen
            - organize header info
        - Profile
            - Settings Modal
            - Stats btn
        - WorkoutGroupCard
            - Display correct information on card
                - Incomplete/ complete
                - This is a list of the users workout
                    - This is either a WorkoutGroup created by user or a CompletedWorkoutGroup
                    - On this view, all workouts are complete. 
                    - API fills in some of this info, I think....

    - Refresh Redux cache
    
    Features:
        - Each Workout Group should display  [wgTitle by you | wgTitle ]
            - So when the user is viewing their completed workout and toggling between the OG and Completed workouts,
                it will be easier to tell which one they are looking at....  
        - Edit User info
            - Change pass
            - Change username
            - Remove account
        
        
        -Edit workouts?
            - This might be a tough decision
                - At first thought, it seems best to delete and just re create it
            
           
            
