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

const en_xa2_demo_feature_tickets = /** @type {(inputs: Demo_Feature_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìckèts •••⟧`)
};

/**
* | output |
* | --- |
* | "Tickets" |
*
* @param {Demo_Feature_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_feature_tickets = /** @type {((inputs?: Demo_Feature_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Feature_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_feature_tickets(inputs)
	if (locale === "en-XA") return en_xa2_demo_feature_tickets(inputs)
	return en_demo_feature_tickets(inputs)
});