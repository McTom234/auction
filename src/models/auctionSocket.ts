import {Socket} from "socket.io";
import {UserData} from "./userData.js";

export class AuctionSocket extends Socket {
	user_data: UserData
	type: string
}