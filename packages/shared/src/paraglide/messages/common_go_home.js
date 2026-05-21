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

/**
* | output |
* | --- |
* | "Go to home" |
*
* @param {Common_Go_HomeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const common_go_home = /** @type {((inputs?: Common_Go_HomeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Go_HomeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_go_home(inputs)
	return es_common_go_home(inputs)
});