/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Select_AllInputs */

const en_ticket_select_all = /** @type {(inputs: Ticket_Select_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select all`)
};

const es_ticket_select_all = /** @type {(inputs: Ticket_Select_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccionar todo`)
};

const en_xa2_ticket_select_all = /** @type {(inputs: Ticket_Select_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct àll •••⟧`)
};

/**
* | output |
* | --- |
* | "Select all" |
*
* @param {Ticket_Select_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_select_all = /** @type {((inputs?: Ticket_Select_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Select_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_select_all(inputs)
	if (locale === "en-XA") return en_xa2_ticket_select_all(inputs)
	return en_ticket_select_all(inputs)
});