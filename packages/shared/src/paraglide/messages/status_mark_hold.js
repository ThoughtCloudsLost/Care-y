/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Status_Mark_HoldInputs */

const en_status_mark_hold = /** @type {(inputs: Status_Mark_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`On hold`)
};

const es_status_mark_hold = /** @type {(inputs: Status_Mark_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En espera`)
};

const en_xa2_status_mark_hold = /** @type {(inputs: Status_Mark_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òn hòld •••⟧`)
};

/**
* | output |
* | --- |
* | "On hold" |
*
* @param {Status_Mark_HoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const status_mark_hold = /** @type {((inputs?: Status_Mark_HoldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Status_Mark_HoldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_status_mark_hold(inputs)
	if (locale === "en-XA") return en_xa2_status_mark_hold(inputs)
	return en_status_mark_hold(inputs)
});