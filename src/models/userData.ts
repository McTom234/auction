import {JwtPayload} from "jsonwebtoken";

export interface UserData extends JwtPayload{
    user_id: number
    user_type: string
    given_name: string
    family_name: string
}
