/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Toast_Link_CopiedInputs */

const en_ticket_toast_link_copied = /** @type {(inputs: Ticket_Toast_Link_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link copied`)
};

const es_ticket_toast_link_copied = /** @type {(inputs: Ticket_Toast_Link_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace copiado`)
};

/**
* | output |
* | --- |
* | "Link copied" |
*
* @param {Ticket_Toast_Link_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_link_copied = /** @type {((inputs?: Ticket_Toast_Link_CopiedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Link_CopiedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_toast_link_copied(inputs)
	return es_ticket_toast_link_copied(inputs)
});