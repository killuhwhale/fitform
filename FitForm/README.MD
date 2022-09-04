


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

npx react-native run-ios --udid 2925F233-FFBB-4143-A849-ACE85DF7F5EF

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
