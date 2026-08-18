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

/**
* | output |
* | --- |
* | "Cookies" |
*
* @param {Intake_Privacy_Cookies_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_cookies_title = /** @type {((inputs?: Intake_Privacy_Cookies_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Cookies_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_cookies_title(inputs)
	return es_intake_privacy_cookies_title(inputs)
});