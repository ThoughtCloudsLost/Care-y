/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Select_CancelInputs */

const en_ticket_select_cancel = /** @type {(inputs: Ticket_Select_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancel selection`)
};

const es_ticket_select_cancel = /** @type {(inputs: Ticket_Select_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancelar selección`)
};

const en_xa2_ticket_select_cancel = /** @type {(inputs: Ticket_Select_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càncèl sèlèctìòn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Cancel selection" |
*
* @param {Ticket_Select_CancelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_select_cancel = /** @type {((inputs?: Ticket_Select_CancelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Select_CancelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_select_cancel(inputs)
	if (locale === "en-XA") return en_xa2_ticket_select_cancel(inputs)
	return en_ticket_select_cancel(inputs)
});