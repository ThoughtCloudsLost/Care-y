/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Push_Enroll_DescInputs */

const en_twofa_push_enroll_desc = /** @type {(inputs: Twofa_Push_Enroll_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verify that push notifications work on your device.`)
};

const es_twofa_push_enroll_desc = /** @type {(inputs: Twofa_Push_Enroll_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verifica que las notificaciones push funcionen en tu dispositivo.`)
};

const en_xa2_twofa_push_enroll_desc = /** @type {(inputs: Twofa_Push_Enroll_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vèrìfy thàt pùsh nòtìfìcàtìòns wòrk òn yòùr dèvìcè. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Verify that push notifications work on your device." |
*
* @param {Twofa_Push_Enroll_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_push_enroll_desc = /** @type {((inputs?: Twofa_Push_Enroll_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_Enroll_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_push_enroll_desc(inputs)
	if (locale === "en-XA") return en_xa2_twofa_push_enroll_desc(inputs)
	return en_twofa_push_enroll_desc(inputs)
});