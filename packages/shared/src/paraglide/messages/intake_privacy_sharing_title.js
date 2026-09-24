/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Sharing_TitleInputs */

const en_intake_privacy_sharing_title = /** @type {(inputs: Intake_Privacy_Sharing_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Who we share your data with`)
};

const es_intake_privacy_sharing_title = /** @type {(inputs: Intake_Privacy_Sharing_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Con quién compartimos tus datos`)
};

const en_xa2_intake_privacy_sharing_title = /** @type {(inputs: Intake_Privacy_Sharing_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whò wè shàrè yòùr dàtà wìth •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Who we share your data with" |
*
* @param {Intake_Privacy_Sharing_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_sharing_title = /** @type {((inputs?: Intake_Privacy_Sharing_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Sharing_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_sharing_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_sharing_title(inputs)
	return en_intake_privacy_sharing_title(inputs)
});