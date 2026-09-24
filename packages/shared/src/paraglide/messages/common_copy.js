/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_CopyInputs */

const en_common_copy = /** @type {(inputs: Common_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copy`)
};

const es_common_copy = /** @type {(inputs: Common_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiar`)
};

const en_xa2_common_copy = /** @type {(inputs: Common_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còpy ••⟧`)
};

/**
* | output |
* | --- |
* | "Copy" |
*
* @param {Common_CopyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const common_copy = /** @type {((inputs?: Common_CopyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_CopyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_common_copy(inputs)
	if (locale === "en-XA") return en_xa2_common_copy(inputs)
	return en_common_copy(inputs)
});