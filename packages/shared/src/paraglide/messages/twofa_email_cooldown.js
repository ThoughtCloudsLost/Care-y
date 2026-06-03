/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ seconds: NonNullable<unknown> }} Twofa_Email_CooldownInputs */

const en_twofa_email_cooldown = /** @type {(inputs: Twofa_Email_CooldownInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Resend in ${i?.seconds}s`)
};

const es_twofa_email_cooldown = /** @type {(inputs: Twofa_Email_CooldownInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Reenviar en ${i?.seconds}s`)
};

/**
* | output |
* | --- |
* | "Resend in {seconds}s" |
*
* @param {Twofa_Email_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_cooldown = /** @type {((inputs: Twofa_Email_CooldownInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Email_CooldownInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_email_cooldown(inputs)
	return es_twofa_email_cooldown(inputs)
});