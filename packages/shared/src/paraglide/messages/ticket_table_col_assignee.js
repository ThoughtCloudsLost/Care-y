/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Table_Col_AssigneeInputs */

const en_ticket_table_col_assignee = /** @type {(inputs: Ticket_Table_Col_AssigneeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assignee`)
};

const es_ticket_table_col_assignee = /** @type {(inputs: Ticket_Table_Col_AssigneeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignado`)
};

/**
* | output |
* | --- |
* | "Assignee" |
*
* @param {Ticket_Table_Col_AssigneeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_assignee = /** @type {((inputs?: Ticket_Table_Col_AssigneeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Col_AssigneeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_table_col_assignee(inputs)
	return es_ticket_table_col_assignee(inputs)
});