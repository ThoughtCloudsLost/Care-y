/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Success_BodyInputs */

const en_intake_success_body = /** @type {(inputs: Intake_Success_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A volunteer will read it as soon as possible.`)
};

const es_intake_success_body = /** @type {(inputs: Intake_Success_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un voluntario lo leera lo antes posible.`)
};

/**
* | output |
* | --- |
* | "A volunteer will read it as soon as possible." |
*
* @param {Intake_Success_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_success_body = /** @type {((inputs?: Intake_Success_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Success_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_success_body(inputs)
	return es_intake_success_body(inputs)
});