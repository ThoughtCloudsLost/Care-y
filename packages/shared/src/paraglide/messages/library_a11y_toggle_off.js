/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_A11y_Toggle_OffInputs */

const en_library_a11y_toggle_off = /** @type {(inputs: Library_A11y_Toggle_OffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hide accessibility issues`)
};

const es_library_a11y_toggle_off = /** @type {(inputs: Library_A11y_Toggle_OffInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ocultar problemas de accesibilidad`)
};

/**
* | output |
* | --- |
* | "Hide accessibility issues" |
*
* @param {Library_A11y_Toggle_OffInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_a11y_toggle_off = /** @type {((inputs?: Library_A11y_Toggle_OffInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_A11y_Toggle_OffInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_a11y_toggle_off(inputs)
	return es_library_a11y_toggle_off(inputs)
});