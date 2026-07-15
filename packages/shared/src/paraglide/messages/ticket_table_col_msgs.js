/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Table_Col_MsgsInputs */

const en_ticket_table_col_msgs = /** @type {(inputs: Ticket_Table_Col_MsgsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Msgs`)
};

const es_ticket_table_col_msgs = /** @type {(inputs: Ticket_Table_Col_MsgsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Msgs`)
};

/**
* | output |
* | --- |
* | "Msgs" |
*
* @param {Ticket_Table_Col_MsgsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_msgs = /** @type {((inputs?: Ticket_Table_Col_MsgsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Col_MsgsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_table_col_msgs(inputs)
	return es_ticket_table_col_msgs(inputs)
});