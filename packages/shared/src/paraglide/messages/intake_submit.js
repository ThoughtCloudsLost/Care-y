/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_SubmitInputs */

const en_intake_submit = /** @type {(inputs: Intake_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send encrypted message`)
};

const es_intake_submit = /** @type {(inputs: Intake_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar mensaje cifrado`)
};

const en_xa2_intake_submit = /** @type {(inputs: Intake_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd èncryptèd mèssàgè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Send encrypted message" |
*
* @param {Intake_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_submit = /** @type {((inputs?: Intake_SubmitInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_SubmitInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_submit(inputs)
	if (locale === "en-XA") return en_xa2_intake_submit(inputs)
	return en_intake_submit(inputs)
});