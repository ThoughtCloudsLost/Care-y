/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Compose_Dismiss_ModeInputs */

const en_ticket_compose_dismiss_mode = /** @type {(inputs: Ticket_Compose_Dismiss_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss compose`)
};

const es_ticket_compose_dismiss_mode = /** @type {(inputs: Ticket_Compose_Dismiss_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar composicion`)
};

/**
* | output |
* | --- |
* | "Dismiss compose" |
*
* @param {Ticket_Compose_Dismiss_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_dismiss_mode = /** @type {((inputs?: Ticket_Compose_Dismiss_ModeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Compose_Dismiss_ModeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_compose_dismiss_mode(inputs)
	return es_ticket_compose_dismiss_mode(inputs)
});