export function validate (input: string | number, currentPrice: number): Error | number {
	input = input.toString();

	if (! (/^\d+([\,\.][0-9][0-9]?)?$/.test(input)) ) return new Error('Invalid number format.');

	input = parseFloat(parseFloat(input.replace(',', '.'))
		                   .toFixed(2));

	if (input <= currentPrice) return new Error('Price must be higher than current price.');

	return input;
}
