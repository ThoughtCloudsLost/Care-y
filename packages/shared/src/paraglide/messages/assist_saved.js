/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Assist_SavedInputs */

const en_assist_saved = /** @type {(inputs: Assist_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disbursement recorded`)
};

const es_assist_saved = /** @type {(inputs: Assist_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desembolso registrado`)
};

const en_xa2_assist_saved = /** @type {(inputs: Assist_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsbùrsèmènt rècòrdèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Disbursement recorded" |
*
* @param {Assist_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_saved = /** @type {((inputs?: Assist_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Assist_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_assist_saved(inputs)
	if (locale === "en-XA") return en_xa2_assist_saved(inputs)
	return en_assist_saved(inputs)
});