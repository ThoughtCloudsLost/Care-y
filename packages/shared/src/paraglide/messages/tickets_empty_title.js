/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Empty_TitleInputs */

const en_tickets_empty_title = /** @type {(inputs: Tickets_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing here yet`)
};

const es_tickets_empty_title = /** @type {(inputs: Tickets_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aún no hay nada aquí`)
};

const en_xa2_tickets_empty_title = /** @type {(inputs: Tickets_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòthìng hèrè yèt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Nothing here yet" |
*
* @param {Tickets_Empty_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_empty_title = /** @type {((inputs?: Tickets_Empty_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Empty_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_empty_title(inputs)
	if (locale === "en-XA") return en_xa2_tickets_empty_title(inputs)
	return en_tickets_empty_title(inputs)
});