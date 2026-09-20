/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Status_Mark_NewInputs */

const en_status_mark_new = /** @type {(inputs: Status_Mark_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New`)
};

const es_status_mark_new = /** @type {(inputs: Status_Mark_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo`)
};

const en_xa2_status_mark_new = /** @type {(inputs: Status_Mark_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw •⟧`)
};

/**
* | output |
* | --- |
* | "New" |
*
* @param {Status_Mark_NewInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const status_mark_new = /** @type {((inputs?: Status_Mark_NewInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Status_Mark_NewInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_status_mark_new(inputs)
	if (locale === "en-XA") return en_xa2_status_mark_new(inputs)
	return en_status_mark_new(inputs)
});