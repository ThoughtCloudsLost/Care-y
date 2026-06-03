/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_PresetsInputs */

const en_getting_started_presets = /** @type {(inputs: Getting_Started_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add preset replies`)
};

const es_getting_started_presets = /** @type {(inputs: Getting_Started_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar respuestas predefinidas`)
};

/**
* | output |
* | --- |
* | "Add preset replies" |
*
* @param {Getting_Started_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_presets = /** @type {((inputs?: Getting_Started_PresetsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_PresetsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_presets(inputs)
	return es_getting_started_presets(inputs)
});