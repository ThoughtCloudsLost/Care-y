/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Call_Method_WebrtcInputs */

const en_consultant_phone_call_method_webrtc = /** @type {(inputs: Consultant_Phone_Call_Method_WebrtcInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Browser call`)
};

const es_consultant_phone_call_method_webrtc = /** @type {(inputs: Consultant_Phone_Call_Method_WebrtcInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamada por navegador`)
};

/**
* | output |
* | --- |
* | "Browser call" |
*
* @param {Consultant_Phone_Call_Method_WebrtcInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_call_method_webrtc = /** @type {((inputs?: Consultant_Phone_Call_Method_WebrtcInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Call_Method_WebrtcInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_call_method_webrtc(inputs)
	return es_consultant_phone_call_method_webrtc(inputs)
});