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

const en_xa2_logs_tab_calls = /** @type {(inputs: Logs_Tab_CallsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càlls ••⟧`)
};

/**
* | output |
* | --- |
* | "Calls" |
*
* @param {Logs_Tab_CallsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_tab_calls = /** @type {((inputs?: Logs_Tab_CallsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Tab_CallsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_tab_calls(inputs)
	if (locale === "en-XA") return en_xa2_logs_tab_calls(inputs)
	return en_logs_tab_calls(inputs)
});