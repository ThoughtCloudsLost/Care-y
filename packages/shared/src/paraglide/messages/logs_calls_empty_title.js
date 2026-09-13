/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Calls_Empty_TitleInputs */

const en_logs_calls_empty_title = /** @type {(inputs: Logs_Calls_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No calls found`)
};

const es_logs_calls_empty_title = /** @type {(inputs: Logs_Calls_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se encontraron llamadas`)
};

/**
* | output |
* | --- |
* | "No calls found" |
*
* @param {Logs_Calls_Empty_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_calls_empty_title = /** @type {((inputs?: Logs_Calls_Empty_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Calls_Empty_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_calls_empty_title(inputs)
	return es_logs_calls_empty_title(inputs)
});