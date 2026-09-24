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

const en_xa2_demo_tickets_tap_card = /** @type {(inputs: Demo_Tickets_Tap_CardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpènìng à tìckèt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Opening a ticket" |
*
* @param {Demo_Tickets_Tap_CardInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_tap_card = /** @type {((inputs?: Demo_Tickets_Tap_CardInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tickets_Tap_CardInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_tickets_tap_card(inputs)
	if (locale === "en-XA") return en_xa2_demo_tickets_tap_card(inputs)
	return en_demo_tickets_tap_card(inputs)
});