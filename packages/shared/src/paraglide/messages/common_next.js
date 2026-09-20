/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_NextInputs */

const en_common_next = /** @type {(inputs: Common_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Next`)
};

const es_common_next = /** @type {(inputs: Common_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Siguiente`)
};

const en_xa2_common_next = /** @type {(inputs: Common_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèxt ••⟧`)
};

/**
* | output |
* | --- |
* | "Next" |
*
* @param {Common_NextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const common_next = /** @type {((inputs?: Common_NextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_NextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_common_next(inputs)
	if (locale === "en-XA") return en_xa2_common_next(inputs)
	return en_common_next(inputs)
});