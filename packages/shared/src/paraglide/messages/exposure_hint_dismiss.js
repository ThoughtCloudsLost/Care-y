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

const en_xa2_exposure_hint_dismiss = /** @type {(inputs: Exposure_Hint_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gòt ìt ••⟧`)
};

/**
* | output |
* | --- |
* | "Got it" |
*
* @param {Exposure_Hint_DismissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_dismiss = /** @type {((inputs?: Exposure_Hint_DismissInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Exposure_Hint_DismissInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_exposure_hint_dismiss(inputs)
	if (locale === "en-XA") return en_xa2_exposure_hint_dismiss(inputs)
	return en_exposure_hint_dismiss(inputs)
});