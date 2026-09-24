/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Who_TitleInputs */

const en_intake_privacy_who_title = /** @type {(inputs: Intake_Privacy_Who_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Who is collecting your data`)
};

const es_intake_privacy_who_title = /** @type {(inputs: Intake_Privacy_Who_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quién recopila tus datos`)
};

const en_xa2_intake_privacy_who_title = /** @type {(inputs: Intake_Privacy_Who_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whò ìs còllèctìng yòùr dàtà •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Who is collecting your data" |
*
* @param {Intake_Privacy_Who_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_who_title = /** @type {((inputs?: Intake_Privacy_Who_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Who_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_who_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_who_title(inputs)
	return en_intake_privacy_who_title(inputs)
});