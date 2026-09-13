/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Success_HeadingInputs */

const en_intake_success_heading = /** @type {(inputs: Intake_Success_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your message was sent`)
};

const es_intake_success_heading = /** @type {(inputs: Intake_Success_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu mensaje fue enviado`)
};

/**
* | output |
* | --- |
* | "Your message was sent" |
*
* @param {Intake_Success_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_success_heading = /** @type {((inputs?: Intake_Success_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Success_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_success_heading(inputs)
	return es_intake_success_heading(inputs)
});