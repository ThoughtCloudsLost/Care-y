/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Note_Hint_ManagersInputs */

const en_ticket_note_hint_managers = /** @type {(inputs: Ticket_Note_Hint_ManagersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`managers`)
};

const es_ticket_note_hint_managers = /** @type {(inputs: Ticket_Note_Hint_ManagersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`gerentes`)
};

/**
* | output |
* | --- |
* | "managers" |
*
* @param {Ticket_Note_Hint_ManagersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_hint_managers = /** @type {((inputs?: Ticket_Note_Hint_ManagersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_Hint_ManagersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_note_hint_managers(inputs)
	return es_ticket_note_hint_managers(inputs)
});