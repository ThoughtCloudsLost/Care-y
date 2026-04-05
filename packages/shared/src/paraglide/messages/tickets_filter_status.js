/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_StatusInputs */

const en_tickets_filter_status = /** @type {(inputs: Tickets_Filter_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status`)
};

/** @type {(inputs: Tickets_Filter_StatusInputs) => LocalizedString} */
const es_tickets_filter_status = en_tickets_filter_status;

/**
* | output |
* | --- |
* | "Status" |
*
* @param {Tickets_Filter_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_status = /** @type {((inputs?: Tickets_Filter_StatusInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_StatusInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_status(inputs)
	return es_tickets_filter_status(inputs)
});