import { gql } from '@apollo/client';

export const getUsers = gql`
    query{
        users{
            _id
            user_gmail
            user_pass
            google_id
            google_token
            access_token
            createdAt
        }
    }
`
export const getUser = gql`
    query{
        user{
            _id
            user_gmail
            user_pass
            google_id
            google_token
            access_token
            createdAt
            cameras{
                _id
                camera_name
                camera_drive
                camera_link
                camera_location
                camera_public
                createdAt
                reports{
                    _id
                    report_time
                    report_description{
                        age
                        gender
                    }
                    createdAt
                }
                videos{
                    _id
                    video_time
                    createdAt
                }
            }
        }
    }
`
export const signin = gql`
    mutation($user_gmail:String,$user_pass:String){
        signin(user_gmail:$user_gmail,user_pass:$user_pass){
            _id
            user_gmail
            user_pass
            google_id
            google_token
            access_token
            createdAt
        }
    }
`
export const signup = gql`
    mutation($user_gmail:String,$user_pass:String,$google_id:String,$google_token:String,$access_tokten:String){
        signup(user_gmail:$user_gmail,user_pass:$user_pass,google_id:$google_id,google_token:$google_token,access_tokten:$access_tokten){
            _id
            user_gmail
            user_pass
            google_id
            google_token
            access_token
            createdAt
        }
    }
`