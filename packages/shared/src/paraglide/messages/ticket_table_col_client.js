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

const en_xa2_ticket_table_col_client = /** @type {(inputs: Ticket_Table_Col_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clìènt ••⟧`)
};

/**
* | output |
* | --- |
* | "Client" |
*
* @param {Ticket_Table_Col_ClientInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_client = /** @type {((inputs?: Ticket_Table_Col_ClientInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Col_ClientInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_table_col_client(inputs)
	if (locale === "en-XA") return en_xa2_ticket_table_col_client(inputs)
	return en_ticket_table_col_client(inputs)
});