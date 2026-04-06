/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Select_ModeInputs */

const en_tickets_select_mode = /** @type {(inputs: Tickets_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select`)
};

const es_tickets_select_mode = /** @type {(inputs: Tickets_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccionar`)
};

/**
* | output |
* | --- |
* | "Select" |
*
* @param {Tickets_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_select_mode = /** @type {((inputs?: Tickets_Select_ModeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Select_ModeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_select_mode(inputs)
	return es_tickets_select_mode(inputs)
});