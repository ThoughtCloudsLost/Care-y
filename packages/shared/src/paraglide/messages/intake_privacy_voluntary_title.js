/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Voluntary_TitleInputs */

const en_intake_privacy_voluntary_title = /** @type {(inputs: Intake_Privacy_Voluntary_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Is providing data required?`)
};

const es_intake_privacy_voluntary_title = /** @type {(inputs: Intake_Privacy_Voluntary_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Es obligatorio dar tus datos?`)
};

/**
* | output |
* | --- |
* | "Is providing data required?" |
*
* @param {Intake_Privacy_Voluntary_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_voluntary_title = /** @type {((inputs?: Intake_Privacy_Voluntary_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Voluntary_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_voluntary_title(inputs)
	return es_intake_privacy_voluntary_title(inputs)
});