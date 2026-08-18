/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_What_TitleInputs */

const en_intake_privacy_what_title = /** @type {(inputs: Intake_Privacy_What_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What data we collect and why`)
};

const es_intake_privacy_what_title = /** @type {(inputs: Intake_Privacy_What_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Que datos recopilamos y por que`)
};

/**
* | output |
* | --- |
* | "What data we collect and why" |
*
* @param {Intake_Privacy_What_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_what_title = /** @type {((inputs?: Intake_Privacy_What_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_What_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_what_title(inputs)
	return es_intake_privacy_what_title(inputs)
});