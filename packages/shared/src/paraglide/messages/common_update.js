/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_UpdateInputs */

const en_common_update = /** @type {(inputs: Common_UpdateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Update`)
};

const es_common_update = /** @type {(inputs: Common_UpdateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actualizar`)
};

const en_xa2_common_update = /** @type {(inputs: Common_UpdateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùpdàtè ••⟧`)
};

/**
* | output |
* | --- |
* | "Update" |
*
* @param {Common_UpdateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const common_update = /** @type {((inputs?: Common_UpdateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_UpdateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_common_update(inputs)
	if (locale === "en-XA") return en_xa2_common_update(inputs)
	return en_common_update(inputs)
});