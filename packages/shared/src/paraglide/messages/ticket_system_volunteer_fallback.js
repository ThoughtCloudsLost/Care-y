/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_System_Volunteer_FallbackInputs */

const en_ticket_system_volunteer_fallback = /** @type {(inputs: Ticket_System_Volunteer_FallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A volunteer`)
};

const es_ticket_system_volunteer_fallback = /** @type {(inputs: Ticket_System_Volunteer_FallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un voluntario`)
};

const en_xa2_ticket_system_volunteer_fallback = /** @type {(inputs: Ticket_System_Volunteer_FallbackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À vòlùntèèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "A volunteer" |
*
* @param {Ticket_System_Volunteer_FallbackInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_volunteer_fallback = /** @type {((inputs?: Ticket_System_Volunteer_FallbackInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Volunteer_FallbackInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_system_volunteer_fallback(inputs)
	if (locale === "en-XA") return en_xa2_ticket_system_volunteer_fallback(inputs)
	return en_ticket_system_volunteer_fallback(inputs)
});