/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Webauthn_Crossplatform_LabelInputs */

const en_twofa_webauthn_crossplatform_label = /** @type {(inputs: Twofa_Webauthn_Crossplatform_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Physical plug-in or tap verification`)
};

const es_twofa_webauthn_crossplatform_label = /** @type {(inputs: Twofa_Webauthn_Crossplatform_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificación por dispositivo físico`)
};

/**
* | output |
* | --- |
* | "Physical plug-in or tap verification" |
*
* @param {Twofa_Webauthn_Crossplatform_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_webauthn_crossplatform_label = /** @type {((inputs?: Twofa_Webauthn_Crossplatform_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Webauthn_Crossplatform_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_webauthn_crossplatform_label(inputs)
	return es_twofa_webauthn_crossplatform_label(inputs)
});