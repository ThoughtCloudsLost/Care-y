/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_DismissInputs */

const en_getting_started_dismiss = /** @type {(inputs: Getting_Started_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss`)
};

const es_getting_started_dismiss = /** @type {(inputs: Getting_Started_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar`)
};

const en_xa2_getting_started_dismiss = /** @type {(inputs: Getting_Started_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsmìss •••⟧`)
};

/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Getting_Started_DismissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_dismiss = /** @type {((inputs?: Getting_Started_DismissInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_DismissInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_dismiss(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_dismiss(inputs)
	return en_getting_started_dismiss(inputs)
});