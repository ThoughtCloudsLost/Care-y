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

/**
* | output |
* | --- |
* | "New" |
*
* @param {Status_Mark_NewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const status_mark_new = /** @type {((inputs?: Status_Mark_NewInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Status_Mark_NewInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_status_mark_new(inputs)
	return es_status_mark_new(inputs)
});