/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Table_Col_ActivityInputs */

const en_ticket_table_col_activity = /** @type {(inputs: Ticket_Table_Col_ActivityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activity`)
};

const es_ticket_table_col_activity = /** @type {(inputs: Ticket_Table_Col_ActivityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actividad`)
};

const en_xa2_ticket_table_col_activity = /** @type {(inputs: Ticket_Table_Col_ActivityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àctìvìty •••⟧`)
};

/**
* | output |
* | --- |
* | "Activity" |
*
* @param {Ticket_Table_Col_ActivityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_activity = /** @type {((inputs?: Ticket_Table_Col_ActivityInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Col_ActivityInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_table_col_activity(inputs)
	if (locale === "en-XA") return en_xa2_ticket_table_col_activity(inputs)
	return en_ticket_table_col_activity(inputs)
});