export class CsvFilter {
	private constructor(private readonly lines: string[]) {}

	static create(lines: string[]) {
		return new CsvFilter(lines);
	}

	get filteredLines() {
		const result = [];
		result.push(this.lines[0]);
		const fields = this.lines[1].split(',');
		const ivaField = fields[4];
		const igicField = fields[5];
		const decimalRegex = '\\d+(\\.\\d+)?';
		const taxFieldsAreMutuallyExclusive =
			(ivaField.match(decimalRegex) || igicField.match(decimalRegex)) && (!ivaField || !igicField);
		const grossAmountField = fields[2];
		const netAmountField = fields[3];
		const netAmountIsWellCalculated =
			this.checkIfNetAmountIsCorrect(netAmountField, grossAmountField, ivaField) ||
			this.checkIfNetAmountIsCorrect(netAmountField, grossAmountField, igicField);
		if (taxFieldsAreMutuallyExclusive && netAmountIsWellCalculated) {
			result.push(this.lines[1]);
		}
		return result;
	}

	private checkIfNetAmountIsCorrect(netAmountField: string, grossAmountField: string, taxField: string) {
		const parsedNetAmount = parseFloat(netAmountField);
		const parsedGrossAmount = parseFloat(grossAmountField);
		const parsedTaxField = parseFloat(taxField);
		return parsedNetAmount === parsedGrossAmount - (parsedGrossAmount * parsedTaxField) / 100;
	}
}
