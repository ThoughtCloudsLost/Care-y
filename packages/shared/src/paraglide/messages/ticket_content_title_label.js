/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Content_Title_LabelInputs */

const en_ticket_content_title_label = /** @type {(inputs: Ticket_Content_Title_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title`)
};

const es_ticket_content_title_label = /** @type {(inputs: Ticket_Content_Title_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Título`)
};

const en_xa2_ticket_content_title_label = /** @type {(inputs: Ticket_Content_Title_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìtlè ••⟧`)
};

/**
* | output |
* | --- |
* | "Title" |
*
* @param {Ticket_Content_Title_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_content_title_label = /** @type {((inputs?: Ticket_Content_Title_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Content_Title_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_content_title_label(inputs)
	if (locale === "en-XA") return en_xa2_ticket_content_title_label(inputs)
	return en_ticket_content_title_label(inputs)
});