/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Push_Enroll_TitleInputs */

const en_twofa_push_enroll_title = /** @type {(inputs: Twofa_Push_Enroll_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Push notifications`)
};

const es_twofa_push_enroll_title = /** @type {(inputs: Twofa_Push_Enroll_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notificaciones push`)
};

/**
* | output |
* | --- |
* | "Push notifications" |
*
* @param {Twofa_Push_Enroll_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_enroll_title = /** @type {((inputs?: Twofa_Push_Enroll_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_Enroll_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_push_enroll_title(inputs)
	return es_twofa_push_enroll_title(inputs)
});