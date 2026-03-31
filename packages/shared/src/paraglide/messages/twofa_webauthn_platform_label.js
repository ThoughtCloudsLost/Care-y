/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Webauthn_Platform_LabelInputs */

const en_twofa_webauthn_platform_label = /** @type {(inputs: Twofa_Webauthn_Platform_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Screen lock verification`)
};

const es_twofa_webauthn_platform_label = /** @type {(inputs: Twofa_Webauthn_Platform_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificación por bloqueo de pantalla`)
};

/**
* | output |
* | --- |
* | "Screen lock verification" |
*
* @param {Twofa_Webauthn_Platform_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_webauthn_platform_label = /** @type {((inputs?: Twofa_Webauthn_Platform_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Webauthn_Platform_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_webauthn_platform_label(inputs)
	return es_twofa_webauthn_platform_label(inputs)
});