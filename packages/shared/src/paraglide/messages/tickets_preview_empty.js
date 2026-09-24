/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Preview_EmptyInputs */

const en_tickets_preview_empty = /** @type {(inputs: Tickets_Preview_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No messages yet`)
};

const es_tickets_preview_empty = /** @type {(inputs: Tickets_Preview_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin mensajes aún`)
};

const en_xa2_tickets_preview_empty = /** @type {(inputs: Tickets_Preview_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò mèssàgès yèt •••••⟧`)
};

/**
* | output |
* | --- |
* | "No messages yet" |
*
* @param {Tickets_Preview_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_preview_empty = /** @type {((inputs?: Tickets_Preview_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Preview_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_preview_empty(inputs)
	if (locale === "en-XA") return en_xa2_tickets_preview_empty(inputs)
	return en_tickets_preview_empty(inputs)
});