/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Filter_DirectionInputs */

const en_logs_filter_direction = /** @type {(inputs: Logs_Filter_DirectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Direction`)
};

const es_logs_filter_direction = /** @type {(inputs: Logs_Filter_DirectionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Direccion`)
};

/**
* | output |
* | --- |
* | "Direction" |
*
* @param {Logs_Filter_DirectionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_filter_direction = /** @type {((inputs?: Logs_Filter_DirectionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Filter_DirectionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_filter_direction(inputs)
	return es_logs_filter_direction(inputs)
});