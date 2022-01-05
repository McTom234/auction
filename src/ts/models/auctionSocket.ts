import {Socket} from "socket.io";
import {UserData} from "./userData";

export interface AuctionSocket extends Socket {
	user_data: UserData
	type: string
}
