/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Push_LabelInputs */

const en_twofa_push_label = /** @type {(inputs: Twofa_Push_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Push notification`)
};

const es_twofa_push_label = /** @type {(inputs: Twofa_Push_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notificación push`)
};

const en_xa2_twofa_push_label = /** @type {(inputs: Twofa_Push_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pùsh nòtìfìcàtìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Push notification" |
*
* @param {Twofa_Push_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_push_label = /** @type {((inputs?: Twofa_Push_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_push_label(inputs)
	if (locale === "en-XA") return en_xa2_twofa_push_label(inputs)
	return en_twofa_push_label(inputs)
});