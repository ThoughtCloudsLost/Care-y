/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Who_TitleInputs */

const en_intake_privacy_who_title = /** @type {(inputs: Intake_Privacy_Who_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Who is collecting your data`)
};

const es_intake_privacy_who_title = /** @type {(inputs: Intake_Privacy_Who_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quien recopila tus datos`)
};

/**
* | output |
* | --- |
* | "Who is collecting your data" |
*
* @param {Intake_Privacy_Who_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_who_title = /** @type {((inputs?: Intake_Privacy_Who_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Who_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_who_title(inputs)
	return es_intake_privacy_who_title(inputs)
});