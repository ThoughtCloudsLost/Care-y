/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Assist_RecordInputs */

const en_assist_record = /** @type {(inputs: Assist_RecordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Record disbursement`)
};

const es_assist_record = /** @type {(inputs: Assist_RecordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registrar desembolso`)
};

const en_xa2_assist_record = /** @type {(inputs: Assist_RecordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòrd dìsbùrsèmènt ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Record disbursement" |
*
* @param {Assist_RecordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const assist_record = /** @type {((inputs?: Assist_RecordInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Assist_RecordInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_assist_record(inputs)
	if (locale === "en-XA") return en_xa2_assist_record(inputs)
	return en_assist_record(inputs)
});