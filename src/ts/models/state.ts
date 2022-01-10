import { BidHistory } from './history';

export interface State {
	auctionId: number;
	currentProduct: number;
	currentPrice: number;
	state: 'lobby' | 'started' | 'over';
	currentHistory: BidHistory[];
}
