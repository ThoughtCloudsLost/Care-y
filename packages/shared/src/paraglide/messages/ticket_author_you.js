/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Ticket_Author_YouInputs */

const en_ticket_author_you = /** @type {(inputs: Ticket_Author_YouInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`You (${i?.name})`)
};

const es_ticket_author_you = /** @type {(inputs: Ticket_Author_YouInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tu (${i?.name})`)
};

const en_xa2_ticket_author_you = /** @type {(inputs: Ticket_Author_YouInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Yòù ( ••${i?.name}) •⟧`)
};

/**
* | output |
* | --- |
* | "You ({name})" |
*
* @param {Ticket_Author_YouInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_author_you = /** @type {((inputs: Ticket_Author_YouInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Author_YouInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_author_you(inputs)
	if (locale === "en-XA") return en_xa2_ticket_author_you(inputs)
	return en_ticket_author_you(inputs)
});