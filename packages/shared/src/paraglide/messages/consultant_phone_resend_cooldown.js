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

/**
* | output |
* | --- |
* | "Resend in {seconds}s" |
*
* @param {Consultant_Phone_Resend_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_resend_cooldown = /** @type {((inputs: Consultant_Phone_Resend_CooldownInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Resend_CooldownInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_resend_cooldown(inputs)
	return es_consultant_phone_resend_cooldown(inputs)
});