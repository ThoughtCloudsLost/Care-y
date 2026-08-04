/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Content_Title_LabelInputs */

const en_ticket_content_title_label = /** @type {(inputs: Ticket_Content_Title_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title`)
};

const es_ticket_content_title_label = /** @type {(inputs: Ticket_Content_Title_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Titulo`)
};

/**
* | output |
* | --- |
* | "Title" |
*
* @param {Ticket_Content_Title_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_content_title_label = /** @type {((inputs?: Ticket_Content_Title_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Content_Title_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_content_title_label(inputs)
	return es_ticket_content_title_label(inputs)
});