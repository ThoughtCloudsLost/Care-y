/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Table_Partial_SortInputs */

const en_ticket_table_partial_sort = /** @type {(inputs: Ticket_Table_Partial_SortInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Sorting ${i?.count} loaded`)
};

const es_ticket_table_partial_sort = /** @type {(inputs: Ticket_Table_Partial_SortInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ordenando ${i?.count} cargados`)
};

/**
* | output |
* | --- |
* | "Sorting {count} loaded" |
*
* @param {Ticket_Table_Partial_SortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_partial_sort = /** @type {((inputs: Ticket_Table_Partial_SortInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Partial_SortInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_table_partial_sort(inputs)
	return es_ticket_table_partial_sort(inputs)
});