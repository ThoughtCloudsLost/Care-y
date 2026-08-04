/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Tab_CallsInputs */

const en_logs_tab_calls = /** @type {(inputs: Logs_Tab_CallsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Calls`)
};

const es_logs_tab_calls = /** @type {(inputs: Logs_Tab_CallsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamadas`)
};

/**
* | output |
* | --- |
* | "Calls" |
*
* @param {Logs_Tab_CallsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_tab_calls = /** @type {((inputs?: Logs_Tab_CallsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Tab_CallsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_tab_calls(inputs)
	return es_logs_tab_calls(inputs)
});