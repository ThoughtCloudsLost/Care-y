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

const en_xa2_intake_hint_dismiss = /** @type {(inputs: Intake_Hint_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gòt ìt ••⟧`)
};

/**
* | output |
* | --- |
* | "Got it" |
*
* @param {Intake_Hint_DismissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_hint_dismiss = /** @type {((inputs?: Intake_Hint_DismissInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Hint_DismissInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_hint_dismiss(inputs)
	if (locale === "en-XA") return en_xa2_intake_hint_dismiss(inputs)
	return en_intake_hint_dismiss(inputs)
});