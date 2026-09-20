/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_What_TitleInputs */

const en_intake_privacy_what_title = /** @type {(inputs: Intake_Privacy_What_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What data we collect and why`)
};

const es_intake_privacy_what_title = /** @type {(inputs: Intake_Privacy_What_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Qué datos recopilamos y por qué`)
};

const en_xa2_intake_privacy_what_title = /** @type {(inputs: Intake_Privacy_What_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whàt dàtà wè còllèct ànd why •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "What data we collect and why" |
*
* @param {Intake_Privacy_What_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_what_title = /** @type {((inputs?: Intake_Privacy_What_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_What_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_what_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_what_title(inputs)
	return en_intake_privacy_what_title(inputs)
});