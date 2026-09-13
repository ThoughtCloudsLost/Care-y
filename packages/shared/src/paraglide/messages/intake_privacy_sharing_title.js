/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Sharing_TitleInputs */

const en_intake_privacy_sharing_title = /** @type {(inputs: Intake_Privacy_Sharing_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Who we share your data with`)
};

const es_intake_privacy_sharing_title = /** @type {(inputs: Intake_Privacy_Sharing_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Con quien compartimos tus datos`)
};

/**
* | output |
* | --- |
* | "Who we share your data with" |
*
* @param {Intake_Privacy_Sharing_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_sharing_title = /** @type {((inputs?: Intake_Privacy_Sharing_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Sharing_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_sharing_title(inputs)
	return es_intake_privacy_sharing_title(inputs)
});