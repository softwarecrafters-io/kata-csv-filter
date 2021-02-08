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
		if (
			taxFieldsAreMutuallyExclusive &&
			parseFloat(fields[3]) === parseFloat(fields[2]) - (parseFloat(fields[2]) * parseFloat(ivaField)) / 100
		) {
			result.push(this.lines[1]);
		}
		return result;
	}
}
