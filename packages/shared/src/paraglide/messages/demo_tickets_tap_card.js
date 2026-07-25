/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Tickets_Tap_CardInputs */

const en_demo_tickets_tap_card = /** @type {(inputs: Demo_Tickets_Tap_CardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opening a ticket`)
};

const es_demo_tickets_tap_card = /** @type {(inputs: Demo_Tickets_Tap_CardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abriendo un ticket`)
};

/**
* | output |
* | --- |
* | "Opening a ticket" |
*
* @param {Demo_Tickets_Tap_CardInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_tap_card = /** @type {((inputs?: Demo_Tickets_Tap_CardInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tickets_Tap_CardInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_tickets_tap_card(inputs)
	return es_demo_tickets_tap_card(inputs)
});