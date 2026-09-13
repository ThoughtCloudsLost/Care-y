/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Composer_PlaceholderInputs */

const en_portal_composer_placeholder = /** @type {(inputs: Portal_Composer_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Write a reply...`)
};

const es_portal_composer_placeholder = /** @type {(inputs: Portal_Composer_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe una respuesta...`)
};

/**
* | output |
* | --- |
* | "Write a reply..." |
*
* @param {Portal_Composer_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_composer_placeholder = /** @type {((inputs?: Portal_Composer_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Composer_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_composer_placeholder(inputs)
	return es_portal_composer_placeholder(inputs)
});