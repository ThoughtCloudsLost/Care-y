/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Assist_UpdatedInputs */

const en_assist_updated = /** @type {(inputs: Assist_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disbursement updated`)
};

const es_assist_updated = /** @type {(inputs: Assist_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desembolso actualizado`)
};

const en_xa2_assist_updated = /** @type {(inputs: Assist_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsbùrsèmènt ùpdàtèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Disbursement updated" |
*
* @param {Assist_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_updated = /** @type {((inputs?: Assist_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Assist_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_assist_updated(inputs)
	if (locale === "en-XA") return en_xa2_assist_updated(inputs)
	return en_assist_updated(inputs)
});