/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Table_Col_PriorityInputs */

const en_ticket_table_col_priority = /** @type {(inputs: Ticket_Table_Col_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Priority`)
};

const es_ticket_table_col_priority = /** @type {(inputs: Ticket_Table_Col_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Prioridad`)
};

/**
* | output |
* | --- |
* | "Priority" |
*
* @param {Ticket_Table_Col_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_priority = /** @type {((inputs?: Ticket_Table_Col_PriorityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Col_PriorityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_table_col_priority(inputs)
	return es_ticket_table_col_priority(inputs)
});