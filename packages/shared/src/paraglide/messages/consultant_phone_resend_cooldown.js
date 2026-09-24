/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ seconds: NonNullable<unknown> }} Consultant_Phone_Resend_CooldownInputs */

const en_consultant_phone_resend_cooldown = /** @type {(inputs: Consultant_Phone_Resend_CooldownInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Resend in ${i?.seconds}s`)
};

const es_consultant_phone_resend_cooldown = /** @type {(inputs: Consultant_Phone_Resend_CooldownInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Reenviar en ${i?.seconds}s`)
};

const en_xa2_consultant_phone_resend_cooldown = /** @type {(inputs: Consultant_Phone_Resend_CooldownInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rèsènd ìn  •••${i?.seconds}s •⟧`)
};

/**
* | output |
* | --- |
* | "Resend in {seconds}s" |
*
* @param {Consultant_Phone_Resend_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_resend_cooldown = /** @type {((inputs: Consultant_Phone_Resend_CooldownInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Resend_CooldownInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_resend_cooldown(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_resend_cooldown(inputs)
	return en_consultant_phone_resend_cooldown(inputs)
});