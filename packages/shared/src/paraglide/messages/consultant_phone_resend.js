/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_ResendInputs */

const en_consultant_phone_resend = /** @type {(inputs: Consultant_Phone_ResendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resend code`)
};

const es_consultant_phone_resend = /** @type {(inputs: Consultant_Phone_ResendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reenviar codigo`)
};

/**
* | output |
* | --- |
* | "Resend code" |
*
* @param {Consultant_Phone_ResendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_resend = /** @type {((inputs?: Consultant_Phone_ResendInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_ResendInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_resend(inputs)
	return es_consultant_phone_resend(inputs)
});