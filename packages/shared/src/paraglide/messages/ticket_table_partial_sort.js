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

const en_xa2_ticket_table_partial_sort = /** @type {(inputs: Ticket_Table_Partial_SortInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sòrtìng  •••${i?.count} lòàdèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Sorting {count} loaded" |
*
* @param {Ticket_Table_Partial_SortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_table_partial_sort = /** @type {((inputs: Ticket_Table_Partial_SortInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Partial_SortInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_table_partial_sort(inputs)
	if (locale === "en-XA") return en_xa2_ticket_table_partial_sort(inputs)
	return en_ticket_table_partial_sort(inputs)
});