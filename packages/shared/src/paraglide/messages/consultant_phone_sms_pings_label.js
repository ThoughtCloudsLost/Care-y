/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Sms_Pings_LabelInputs */

const en_consultant_phone_sms_pings_label = /** @type {(inputs: Consultant_Phone_Sms_Pings_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Text me notification pings`)
};

const es_consultant_phone_sms_pings_label = /** @type {(inputs: Consultant_Phone_Sms_Pings_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviarme notificaciones por SMS`)
};

/**
* | output |
* | --- |
* | "Text me notification pings" |
*
* @param {Consultant_Phone_Sms_Pings_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_sms_pings_label = /** @type {((inputs?: Consultant_Phone_Sms_Pings_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Sms_Pings_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_sms_pings_label(inputs)
	return es_consultant_phone_sms_pings_label(inputs)
});