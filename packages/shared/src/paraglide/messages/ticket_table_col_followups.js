/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Table_Col_FollowupsInputs */

const en_ticket_table_col_followups = /** @type {(inputs: Ticket_Table_Col_FollowupsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Follow-ups`)
};

const es_ticket_table_col_followups = /** @type {(inputs: Ticket_Table_Col_FollowupsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seguimientos`)
};

/**
* | output |
* | --- |
* | "Follow-ups" |
*
* @param {Ticket_Table_Col_FollowupsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_followups = /** @type {((inputs?: Ticket_Table_Col_FollowupsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Col_FollowupsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_table_col_followups(inputs)
	return es_ticket_table_col_followups(inputs)
});