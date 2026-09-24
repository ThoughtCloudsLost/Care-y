/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Table_Col_StatusInputs */

const en_ticket_table_col_status = /** @type {(inputs: Ticket_Table_Col_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status`)
};

const es_ticket_table_col_status = /** @type {(inputs: Ticket_Table_Col_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estado`)
};

const en_xa2_ticket_table_col_status = /** @type {(inputs: Ticket_Table_Col_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stàtùs ••⟧`)
};

/**
* | output |
* | --- |
* | "Status" |
*
* @param {Ticket_Table_Col_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_status = /** @type {((inputs?: Ticket_Table_Col_StatusInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Col_StatusInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_table_col_status(inputs)
	if (locale === "en-XA") return en_xa2_ticket_table_col_status(inputs)
	return en_ticket_table_col_status(inputs)
});