/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Shell_Dismiss_OverlayInputs */

const en_shell_dismiss_overlay = /** @type {(inputs: Shell_Dismiss_OverlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss`)
};

const es_shell_dismiss_overlay = /** @type {(inputs: Shell_Dismiss_OverlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descartar`)
};

const en_xa2_shell_dismiss_overlay = /** @type {(inputs: Shell_Dismiss_OverlayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsmìss •••⟧`)
};

/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Shell_Dismiss_OverlayInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const shell_dismiss_overlay = /** @type {((inputs?: Shell_Dismiss_OverlayInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Shell_Dismiss_OverlayInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_shell_dismiss_overlay(inputs)
	if (locale === "en-XA") return en_xa2_shell_dismiss_overlay(inputs)
	return en_shell_dismiss_overlay(inputs)
});