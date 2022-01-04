import {History} from "./history.js";

export interface State {
    auctionId: number
    currentProduct: number
    currentPrice: number
    state: string
    currentHistory: History[]
}
