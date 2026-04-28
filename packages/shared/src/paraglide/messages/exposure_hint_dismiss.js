/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Exposure_Hint_DismissInputs */

const en_exposure_hint_dismiss = /** @type {(inputs: Exposure_Hint_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Got it`)
};

const es_exposure_hint_dismiss = /** @type {(inputs: Exposure_Hint_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Entendido`)
};

/**
* | output |
* | --- |
* | "Got it" |
*
* @param {Exposure_Hint_DismissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_dismiss = /** @type {((inputs?: Exposure_Hint_DismissInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Exposure_Hint_DismissInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_exposure_hint_dismiss(inputs)
	return es_exposure_hint_dismiss(inputs)
});