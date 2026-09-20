/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Go_HomeInputs */

const en_common_go_home = /** @type {(inputs: Common_Go_HomeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Go to home`)
};

const es_common_go_home = /** @type {(inputs: Common_Go_HomeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ir al inicio`)
};

const en_xa2_common_go_home = /** @type {(inputs: Common_Go_HomeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gò tò hòmè •••⟧`)
};

/**
* | output |
* | --- |
* | "Go to home" |
*
* @param {Common_Go_HomeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const common_go_home = /** @type {((inputs?: Common_Go_HomeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Go_HomeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_common_go_home(inputs)
	if (locale === "en-XA") return en_xa2_common_go_home(inputs)
	return en_common_go_home(inputs)
});