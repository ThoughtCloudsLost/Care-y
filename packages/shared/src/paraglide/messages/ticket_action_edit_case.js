/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Ticket_Action_Edit_CaseInputs */

const en_ticket_action_edit_case = /** @type {(inputs: Ticket_Action_Edit_CaseInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Edit ${i?.ticket}`)
};

const es_ticket_action_edit_case = /** @type {(inputs: Ticket_Action_Edit_CaseInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Editar ${i?.ticket}`)
};

const en_xa2_ticket_action_edit_case = /** @type {(inputs: Ticket_Action_Edit_CaseInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Èdìt  ••${i?.ticket}⟧`)
};

/**
* | output |
* | --- |
* | "Edit {ticket}" |
*
* @param {Ticket_Action_Edit_CaseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_edit_case = /** @type {((inputs: Ticket_Action_Edit_CaseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_Edit_CaseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_edit_case(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_edit_case(inputs)
	return en_ticket_action_edit_case(inputs)
});