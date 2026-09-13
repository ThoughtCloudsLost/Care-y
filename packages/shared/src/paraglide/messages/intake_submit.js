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

/**
* | output |
* | --- |
* | "Send encrypted message" |
*
* @param {Intake_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_submit = /** @type {((inputs?: Intake_SubmitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_SubmitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_submit(inputs)
	return es_intake_submit(inputs)
});