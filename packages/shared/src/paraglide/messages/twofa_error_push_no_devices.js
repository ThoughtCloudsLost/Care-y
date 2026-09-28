/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Error_Push_No_DevicesInputs */

const en_twofa_error_push_no_devices = /** @type {(inputs: Twofa_Error_Push_No_DevicesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No device is set up to receive sign-in requests. Choose another method.`)
};

const es_twofa_error_push_no_devices = /** @type {(inputs: Twofa_Error_Push_No_DevicesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ningún dispositivo está configurado para recibir solicitudes de inicio de sesión. Elige otro método.`)
};

const en_xa2_twofa_error_push_no_devices = /** @type {(inputs: Twofa_Error_Push_No_DevicesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò dèvìcè ìs sèt ùp tò rècèìvè sìgn-ìn rèqùèsts. Chòòsè ànòthèr mèthòd. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No device is set up to receive sign-in requests. Choose another method." |
*
* @param {Twofa_Error_Push_No_DevicesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_push_no_devices = /** @type {((inputs?: Twofa_Error_Push_No_DevicesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_Push_No_DevicesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_error_push_no_devices(inputs)
	if (locale === "en-XA") return en_xa2_twofa_error_push_no_devices(inputs)
	return en_twofa_error_push_no_devices(inputs)
});