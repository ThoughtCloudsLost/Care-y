/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Call_OptionsInputs */

const en_ticket_call_options = /** @type {(inputs: Ticket_Call_OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call options`)
};

const es_ticket_call_options = /** @type {(inputs: Ticket_Call_OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opciones de llamada`)
};

const en_xa2_ticket_call_options = /** @type {(inputs: Ticket_Call_OptionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll òptìòns ••••⟧`)
};

/**
* | output |
* | --- |
* | "Call options" |
*
* @param {Ticket_Call_OptionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_call_options = /** @type {((inputs?: Ticket_Call_OptionsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Call_OptionsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_call_options(inputs)
	if (locale === "en-XA") return en_xa2_ticket_call_options(inputs)
	return en_ticket_call_options(inputs)
});