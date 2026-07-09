/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Meta_YouInputs */

const en_ticket_meta_you = /** @type {(inputs: Ticket_Meta_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`you`)
};

const es_ticket_meta_you = /** @type {(inputs: Ticket_Meta_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`tú`)
};

/**
* | output |
* | --- |
* | "you" |
*
* @param {Ticket_Meta_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_meta_you = /** @type {((inputs?: Ticket_Meta_YouInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Meta_YouInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_meta_you(inputs)
	return es_ticket_meta_you(inputs)
});