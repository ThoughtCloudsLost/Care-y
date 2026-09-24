/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_AuthorInputs */

const en_ticket_filter_author = /** @type {(inputs: Ticket_Filter_AuthorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Author`)
};

const es_ticket_filter_author = /** @type {(inputs: Ticket_Filter_AuthorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Autor`)
};

const en_xa2_ticket_filter_author = /** @type {(inputs: Ticket_Filter_AuthorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àùthòr ••⟧`)
};

/**
* | output |
* | --- |
* | "Author" |
*
* @param {Ticket_Filter_AuthorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_author = /** @type {((inputs?: Ticket_Filter_AuthorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_AuthorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_author(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_author(inputs)
	return en_ticket_filter_author(inputs)
});