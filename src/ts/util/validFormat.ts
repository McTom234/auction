export function validate (input: string | number, currentPrice: number, minAdd: number = 0.01): Error | number {
	input = input.toString();

	if (!(/^\d+([\,\.][0-9][0-9]?)?$/.test(input))) return new Error('Du verwendest nicht erlaubte Zeichen!');

	input = parseFloat(parseFloat(input.replace(',', '.'))
		                   .toFixed(2));

	if (input < (currentPrice + minAdd)) return new Error(`Dein Gebot muss ${minAdd.toFixed(2).replace('.', ',')}€ höher sein, als das Letzte!`);

	return input;
}
