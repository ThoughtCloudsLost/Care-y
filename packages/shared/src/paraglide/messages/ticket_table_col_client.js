/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Table_Col_ClientInputs */

const en_ticket_table_col_client = /** @type {(inputs: Ticket_Table_Col_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Client`)
};

const es_ticket_table_col_client = /** @type {(inputs: Ticket_Table_Col_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cliente`)
};

/**
* | output |
* | --- |
* | "Client" |
*
* @param {Ticket_Table_Col_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_client = /** @type {((inputs?: Ticket_Table_Col_ClientInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Col_ClientInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_table_col_client(inputs)
	return es_ticket_table_col_client(inputs)
});