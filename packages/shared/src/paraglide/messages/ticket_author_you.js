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

/**
* | output |
* | --- |
* | "You ({name})" |
*
* @param {Ticket_Author_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_author_you = /** @type {((inputs: Ticket_Author_YouInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Author_YouInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_author_you(inputs)
	return es_ticket_author_you(inputs)
});