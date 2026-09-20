/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown> }} Tickets_TitleInputs */

const en_tickets_title = /** @type {(inputs: Tickets_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}`)
};

const es_tickets_title = /** @type {(inputs: Tickets_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}`)
};

const en_xa2_tickets_title = /** @type {(inputs: Tickets_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Tickets}⟧`)
};

/**
* | output |
* | --- |
* | "{Tickets}" |
*
* @param {Tickets_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_title = /** @type {((inputs: Tickets_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_title(inputs)
	if (locale === "en-XA") return en_xa2_tickets_title(inputs)
	return en_tickets_title(inputs)
});