/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Feature_TicketsInputs */

const en_demo_feature_tickets = /** @type {(inputs: Demo_Feature_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets`)
};

const es_demo_feature_tickets = /** @type {(inputs: Demo_Feature_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets`)
};

/**
* | output |
* | --- |
* | "Tickets" |
*
* @param {Demo_Feature_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_feature_tickets = /** @type {((inputs?: Demo_Feature_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Feature_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_feature_tickets(inputs)
	return es_demo_feature_tickets(inputs)
});