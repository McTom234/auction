import { BidHistory } from './history';

export interface State {
	currentProduct: number
	currentPrice: number
	state: 'lobby' | 'started' | 'over'
	currentHistory: BidHistory[]
	startTime: Date
}
