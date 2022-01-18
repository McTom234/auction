export function validate (input: string | number, currentPrice: number): Error | number {
	input = input.toString();

	if (!(/^\d+([\,\.][0-9][0-9]?)?$/.test(input))) return new Error('Du verwendest nicht erlaubte Zeichen!');

	input = parseFloat(parseFloat(input.replace(',', '.'))
		                   .toFixed(2));

	if (input <= currentPrice) return new Error('Dein Gebot muss höher sein, als das Letzte!');

	return input;
}
