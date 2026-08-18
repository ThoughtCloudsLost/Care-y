/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Hint_DismissInputs */

const en_intake_hint_dismiss = /** @type {(inputs: Intake_Hint_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Got it`)
};

const es_intake_hint_dismiss = /** @type {(inputs: Intake_Hint_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Entendido`)
};

/**
* | output |
* | --- |
* | "Got it" |
*
* @param {Intake_Hint_DismissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_hint_dismiss = /** @type {((inputs?: Intake_Hint_DismissInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Hint_DismissInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_hint_dismiss(inputs)
	return es_intake_hint_dismiss(inputs)
});