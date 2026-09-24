/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Select_ModeInputs */

const en_ticket_select_mode = /** @type {(inputs: Ticket_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select messages`)
};

const es_ticket_select_mode = /** @type {(inputs: Ticket_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccionar mensajes`)
};

const en_xa2_ticket_select_mode = /** @type {(inputs: Ticket_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct mèssàgès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Select messages" |
*
* @param {Ticket_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_select_mode = /** @type {((inputs?: Ticket_Select_ModeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Select_ModeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_select_mode(inputs)
	if (locale === "en-XA") return en_xa2_ticket_select_mode(inputs)
	return en_ticket_select_mode(inputs)
});