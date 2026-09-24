/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Create_Coming_SoonInputs */

const en_create_coming_soon = /** @type {(inputs: Create_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coming soon`)
};

const es_create_coming_soon = /** @type {(inputs: Create_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Próximamente`)
};

const en_xa2_create_coming_soon = /** @type {(inputs: Create_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmìng sòòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Coming soon" |
*
* @param {Create_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const create_coming_soon = /** @type {((inputs?: Create_Coming_SoonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_Coming_SoonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_create_coming_soon(inputs)
	if (locale === "en-XA") return en_xa2_create_coming_soon(inputs)
	return en_create_coming_soon(inputs)
});