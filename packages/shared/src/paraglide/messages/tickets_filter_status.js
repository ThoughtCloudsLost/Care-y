/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_StatusInputs */

const en_tickets_filter_status = /** @type {(inputs: Tickets_Filter_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status`)
};

const es_tickets_filter_status = /** @type {(inputs: Tickets_Filter_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estado`)
};

const en_xa2_tickets_filter_status = /** @type {(inputs: Tickets_Filter_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stàtùs ••⟧`)
};

/**
* | output |
* | --- |
* | "Status" |
*
* @param {Tickets_Filter_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_status = /** @type {((inputs?: Tickets_Filter_StatusInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_StatusInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_status(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_status(inputs)
	return en_tickets_filter_status(inputs)
});