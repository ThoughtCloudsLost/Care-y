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

const en_xa2_twofa_webauthn_crossplatform_label = /** @type {(inputs: Twofa_Webauthn_Crossplatform_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Physìcàl plùg-ìn òr tàp vèrìfìcàtìòn •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Physical plug-in or tap verification" |
*
* @param {Twofa_Webauthn_Crossplatform_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_webauthn_crossplatform_label = /** @type {((inputs?: Twofa_Webauthn_Crossplatform_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Webauthn_Crossplatform_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_webauthn_crossplatform_label(inputs)
	if (locale === "en-XA") return en_xa2_twofa_webauthn_crossplatform_label(inputs)
	return en_twofa_webauthn_crossplatform_label(inputs)
});