/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_MeInputs */

const en_tickets_filter_me = /** @type {(inputs: Tickets_Filter_MeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Me`)
};

const es_tickets_filter_me = /** @type {(inputs: Tickets_Filter_MeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Yo`)
};

/**
* | output |
* | --- |
* | "Me" |
*
* @param {Tickets_Filter_MeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_me = /** @type {((inputs?: Tickets_Filter_MeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_MeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_me(inputs)
	return es_tickets_filter_me(inputs)
});