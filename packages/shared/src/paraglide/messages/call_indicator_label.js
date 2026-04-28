/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Call_Indicator_LabelInputs */

const en_call_indicator_label = /** @type {(inputs: Call_Indicator_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call in progress`)
};

const es_call_indicator_label = /** @type {(inputs: Call_Indicator_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamada en curso`)
};

/**
* | output |
* | --- |
* | "Call in progress" |
*
* @param {Call_Indicator_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_indicator_label = /** @type {((inputs?: Call_Indicator_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Call_Indicator_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_call_indicator_label(inputs)
	return es_call_indicator_label(inputs)
});