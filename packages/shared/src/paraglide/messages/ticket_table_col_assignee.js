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

const en_xa2_ticket_table_col_assignee = /** @type {(inputs: Ticket_Table_Col_AssigneeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àssìgnèè •••⟧`)
};

/**
* | output |
* | --- |
* | "Assignee" |
*
* @param {Ticket_Table_Col_AssigneeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_table_col_assignee = /** @type {((inputs?: Ticket_Table_Col_AssigneeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Table_Col_AssigneeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_table_col_assignee(inputs)
	if (locale === "en-XA") return en_xa2_ticket_table_col_assignee(inputs)
	return en_ticket_table_col_assignee(inputs)
});