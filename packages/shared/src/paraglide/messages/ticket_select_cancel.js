/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Select_CancelInputs */

const en_ticket_select_cancel = /** @type {(inputs: Ticket_Select_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancel selection`)
};

const es_ticket_select_cancel = /** @type {(inputs: Ticket_Select_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancelar seleccion`)
};

/**
* | output |
* | --- |
* | "Cancel selection" |
*
* @param {Ticket_Select_CancelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_select_cancel = /** @type {((inputs?: Ticket_Select_CancelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Select_CancelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_select_cancel(inputs)
	return es_ticket_select_cancel(inputs)
});