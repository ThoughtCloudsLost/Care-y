/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Webauthn_Platform_DescInputs */

const en_twofa_webauthn_platform_desc = /** @type {(inputs: Twofa_Webauthn_Platform_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This uses your screen lock method. The same biometrics (fingerprint, face scan) or PIN you already use to unlock your phone or computer to verify it's really you. It works because even if someone learns your password, they can't unlock your screen from far away. They would need to be holding your phone or sitting at your computer.`)
};

const es_twofa_webauthn_platform_desc = /** @type {(inputs: Twofa_Webauthn_Platform_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usa el método de bloqueo de tu pantalla. Los mismos datos biométricos (huella dactilar, reconocimiento facial) o PIN que ya usas para desbloquear tu teléfono o computadora verifican que eres tú. Funciona porque aunque alguien conozca tu contraseña, no puede desbloquear tu pantalla a distancia. Necesitaría tener tu teléfono o estar frente a tu computadora.`)
};

/**
* | output |
* | --- |
* | "This uses your screen lock method. The same biometrics (fingerprint, face scan) or PIN you already use to unlock your phone or computer to verify it's really..." |
*
* @param {Twofa_Webauthn_Platform_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_webauthn_platform_desc = /** @type {((inputs?: Twofa_Webauthn_Platform_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Webauthn_Platform_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_webauthn_platform_desc(inputs)
	return es_twofa_webauthn_platform_desc(inputs)
});