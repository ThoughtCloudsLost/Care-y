/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_A11y_Toggle_OnInputs */

const en_library_a11y_toggle_on = /** @type {(inputs: Library_A11y_Toggle_OnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Show accessibility issues`)
};

const es_library_a11y_toggle_on = /** @type {(inputs: Library_A11y_Toggle_OnInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mostrar problemas de accesibilidad`)
};

/**
* | output |
* | --- |
* | "Show accessibility issues" |
*
* @param {Library_A11y_Toggle_OnInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_a11y_toggle_on = /** @type {((inputs?: Library_A11y_Toggle_OnInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_A11y_Toggle_OnInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_a11y_toggle_on(inputs)
	return es_library_a11y_toggle_on(inputs)
});