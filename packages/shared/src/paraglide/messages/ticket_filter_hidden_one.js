/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Hidden_OneInputs */

const en_ticket_filter_hidden_one = /** @type {(inputs: Ticket_Filter_Hidden_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 filtered message`)
};

const es_ticket_filter_hidden_one = /** @type {(inputs: Ticket_Filter_Hidden_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 mensaje filtrado`)
};

const en_xa2_ticket_filter_hidden_one = /** @type {(inputs: Ticket_Filter_Hidden_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦1 fìltèrèd mèssàgè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "1 filtered message" |
*
* @param {Ticket_Filter_Hidden_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_hidden_one = /** @type {((inputs?: Ticket_Filter_Hidden_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Hidden_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_hidden_one(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_hidden_one(inputs)
	return en_ticket_filter_hidden_one(inputs)
});