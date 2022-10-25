
# Gym Bay
# FitForm

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
        - Handle expired access tokens in Middleware
            - This should be able to follow same mechanics as the other project.
            - When access token returns an auth error, refresh w/ refresh token
            - If successful, retry original attempt
            - IF fails, return user to login page

            -Aplslice might be tricky......

        - Delete media from Digital Ocean when Entity is deleted
            - This is gonna be tricky.

        - Reset password
            - Provide old password and new password.

        - Forgot password
            - Triggger an action to send an email
            - That email must contain a code that is associated with an email
                - How does this work?
                - Options:
                    - Link to follow to web
                    - Link that opens on mobile
                    - Code that user can enter in app
            - User enters email and code
            - App looks up in resetPassword table
            - If finds email code pair, allow reset.
            - Send email, newpassword, and code to reset API Endpoint.
            - Endpoint will check code again
            - It updates new password
            - It earases email/ code entry in resetPassword Table
            - Returns response, and now user has changed password


            1. Generate unique codes
            2. Create resetPassword Table
            3. Once stored in table, send an email w/ code
            4. Create a cleanup script/ EOL to remove entries after 15mins old
                
    
V2 Features:
    Auth:
        - Edit User info
        - Change pass
        - Remove account       
            
 