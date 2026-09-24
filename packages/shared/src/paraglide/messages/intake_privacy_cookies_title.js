/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Cookies_TitleInputs */

const en_intake_privacy_cookies_title = /** @type {(inputs: Intake_Privacy_Cookies_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cookies`)
};

const es_intake_privacy_cookies_title = /** @type {(inputs: Intake_Privacy_Cookies_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cookies`)
};

const en_xa2_intake_privacy_cookies_title = /** @type {(inputs: Intake_Privacy_Cookies_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còòkìès •••⟧`)
};

/**
* | output |
* | --- |
* | "Cookies" |
*
* @param {Intake_Privacy_Cookies_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_cookies_title = /** @type {((inputs?: Intake_Privacy_Cookies_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Cookies_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_cookies_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_cookies_title(inputs)
	return en_intake_privacy_cookies_title(inputs)
});