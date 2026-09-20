/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_VerifyingInputs */

const en_consultant_phone_verifying = /** @type {(inputs: Consultant_Phone_VerifyingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verifying...`)
};

const es_consultant_phone_verifying = /** @type {(inputs: Consultant_Phone_VerifyingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificando...`)
};

const en_xa2_consultant_phone_verifying = /** @type {(inputs: Consultant_Phone_VerifyingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vèrìfyìng... ••••⟧`)
};

/**
* | output |
* | --- |
* | "Verifying..." |
*
* @param {Consultant_Phone_VerifyingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_verifying = /** @type {((inputs?: Consultant_Phone_VerifyingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_VerifyingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_verifying(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_verifying(inputs)
	return en_consultant_phone_verifying(inputs)
});