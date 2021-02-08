import { CsvFilter } from '../core/csvFilter';

interface FileWithOneInvoiceLineHavingParams {
	ivaTax?: string;
	igicTax?: string;
	netAmount?: string;
	nif?: string;
}

describe('CSV filter', () => {
	const header = 'Num_factura, Fecha, Bruto, Neto, IVA, IGIC, Concepto, CIF_cliente, NIF_cliente';
	const emptyField = '';

	it('allows for correct lines only', () => {
		const invoiceLine = fileWithOneInvoiceLineHaving({});
		const csvFilter = CsvFilter.create([header, invoiceLine]);

		const result = csvFilter.filteredLines;

		expect(result).toEqual([header, invoiceLine]);
	});

	it('allows only the correct lines when the igic tax is applied', () => {
		const invoiceLine = fileWithOneInvoiceLineHaving({ ivaTax: '', igicTax: '7', netAmount: '930', nif: emptyField });
		const csvFilter = CsvFilter.create([header, invoiceLine]);

		const result = csvFilter.filteredLines;

		expect(result).toEqual([header, invoiceLine]);
	});

	it('excludes lines with both tax fields populated as they are exclusive', () => {
		const invoiceLine = fileWithOneInvoiceLineHaving({
			ivaTax: '21',
			igicTax: '7',
			netAmount: '790',
			nif: emptyField,
		});
		const csvFilter = CsvFilter.create([header, invoiceLine]);

		const result = csvFilter.filteredLines;

		expect(result).toEqual([header]);
	});

	it('excludes lines with both tax field empty as one is required', () => {
		const invoiceLine = fileWithOneInvoiceLineHaving({ ivaTax: '', igicTax: '', netAmount: '790', nif: emptyField });
		const csvFilter = CsvFilter.create([header, invoiceLine]);

		const result = csvFilter.filteredLines;

		expect(result).toEqual([header]);
	});

	it('excludes lines with non decimal tax fields', () => {
		const invoiceLine = fileWithOneInvoiceLineHaving({
			ivaTax: 'XYZ',
			igicTax: '',
			netAmount: '790',
			nif: emptyField,
		});
		const csvFilter = CsvFilter.create([header, invoiceLine]);

		const result = csvFilter.filteredLines;

		expect(result).toEqual([header]);
	});

	it('excludes lines with both tax fields populated even if non decimal', () => {
		const invoiceLine = fileWithOneInvoiceLineHaving({
			ivaTax: 'XYZ',
			igicTax: '7',
			netAmount: '790',
			nif: emptyField,
		});
		const csvFilter = CsvFilter.create([header, invoiceLine]);

		const result = csvFilter.filteredLines;

		expect(result).toEqual([header]);
	});

	it('excludes lines with miscalculated net amount for iva tax', () => {
		const invoiceLine = fileWithOneInvoiceLineHaving({
			ivaTax: '21',
			igicTax: '',
			netAmount: '900',
			nif: emptyField,
		});
		const csvFilter = CsvFilter.create([header, invoiceLine]);

		const result = csvFilter.filteredLines;

		expect(result).toEqual([header]);
	});

	it('excludes lines with miscalculated net amount for igic tax', () => {
		const invoiceLine = fileWithOneInvoiceLineHaving({ ivaTax: '', igicTax: '7', netAmount: '900', nif: emptyField });
		const csvFilter = CsvFilter.create([header, invoiceLine]);

		const result = csvFilter.filteredLines;

		expect(result).toEqual([header]);
	});

	function fileWithOneInvoiceLineHaving({
		ivaTax = '21',
		igicTax = emptyField,
		netAmount = '790',
		nif = emptyField,
	}: FileWithOneInvoiceLineHavingParams) {
		const invoiceId = '1';
		const invoiceDate = '02/05/2021';
		const grossAmount = '1000';
		const concept = 'ACER Laptop';
		const cif = 'B76430134';
		return [invoiceId, invoiceDate, grossAmount, netAmount, ivaTax, igicTax, concept, cif, nif].join(',');
	}
});
