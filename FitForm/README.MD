


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

    Auth:
        - Add user registration
        - Handle expired access tokens in Middleware

    Profile:
        - Summary of workouts
        - Add gym/class/workout buttons
            - Add * Views...

    Home:
        - Filter gyms
        - Filter classes
        - Filter workout groups


    Todo Next:
    
        Finish creating other types of workouts, only reps are completed...

        Features:
            - Refresh Redux cache

            - Edit User info
                - Change pass
                - Change username
            
            - Search Gyms Feature
            - Filter Gyms and Classes Component
            
