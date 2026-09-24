/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Sms_Pings_AriaInputs */

const en_consultant_phone_sms_pings_aria = /** @type {(inputs: Consultant_Phone_Sms_Pings_AriaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Store my number for SMS pings`)
};

const es_consultant_phone_sms_pings_aria = /** @type {(inputs: Consultant_Phone_Sms_Pings_AriaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Almacenar mi número para notificaciones SMS`)
};

const en_xa2_consultant_phone_sms_pings_aria = /** @type {(inputs: Consultant_Phone_Sms_Pings_AriaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stòrè my nùmbèr fòr SMS pìngs •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Store my number for SMS pings" |
*
* @param {Consultant_Phone_Sms_Pings_AriaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_sms_pings_aria = /** @type {((inputs?: Consultant_Phone_Sms_Pings_AriaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Sms_Pings_AriaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_sms_pings_aria(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_sms_pings_aria(inputs)
	return en_consultant_phone_sms_pings_aria(inputs)
});