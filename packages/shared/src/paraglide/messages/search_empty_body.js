/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ query: NonNullable<unknown> }} Search_Empty_BodyInputs */

const en_search_empty_body = /** @type {(inputs: Search_Empty_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Nothing unlocked on this device matches "${i?.query}".`)
};

const es_search_empty_body = /** @type {(inputs: Search_Empty_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Nada de lo desbloqueado en este dispositivo coincide con "${i?.query}".`)
};

const en_xa2_search_empty_body = /** @type {(inputs: Search_Empty_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nòthìng ùnlòckèd òn thìs dèvìcè màtchès " •••••••••••••${i?.query}". •⟧`)
};

/**
* | output |
* | --- |
* | "Nothing unlocked on this device matches \"{query}\"." |
*
* @param {Search_Empty_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_empty_body = /** @type {((inputs: Search_Empty_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Empty_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_empty_body(inputs)
	if (locale === "en-XA") return en_xa2_search_empty_body(inputs)
	return en_search_empty_body(inputs)
});