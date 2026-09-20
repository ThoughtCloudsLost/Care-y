/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ managers: NonNullable<unknown> }} Ticket_Note_Hint_ManagersInputs */

const en_ticket_note_hint_managers = /** @type {(inputs: Ticket_Note_Hint_ManagersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.managers}`)
};

const es_ticket_note_hint_managers = /** @type {(inputs: Ticket_Note_Hint_ManagersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.managers}`)
};

const en_xa2_ticket_note_hint_managers = /** @type {(inputs: Ticket_Note_Hint_ManagersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.managers}⟧`)
};

/**
* | output |
* | --- |
* | "{managers}" |
*
* @param {Ticket_Note_Hint_ManagersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_hint_managers = /** @type {((inputs: Ticket_Note_Hint_ManagersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_Hint_ManagersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_note_hint_managers(inputs)
	if (locale === "en-XA") return en_xa2_ticket_note_hint_managers(inputs)
	return en_ticket_note_hint_managers(inputs)
});