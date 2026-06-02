/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_System_Priority_ChangeInputs */

const en_ticket_system_priority_change = /** @type {(inputs: Ticket_System_Priority_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Priority changed`)
};

const es_ticket_system_priority_change = /** @type {(inputs: Ticket_System_Priority_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Prioridad cambiada`)
};

/**
* | output |
* | --- |
* | "Priority changed" |
*
* @param {Ticket_System_Priority_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_priority_change = /** @type {((inputs?: Ticket_System_Priority_ChangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Priority_ChangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_system_priority_change(inputs)
	return es_ticket_system_priority_change(inputs)
});