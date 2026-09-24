/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Status_Mark_ClosedInputs */

const en_status_mark_closed = /** @type {(inputs: Status_Mark_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closed`)
};

const es_status_mark_closed = /** @type {(inputs: Status_Mark_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrado`)
};

const en_xa2_status_mark_closed = /** @type {(inputs: Status_Mark_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsèd ••⟧`)
};

/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Status_Mark_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const status_mark_closed = /** @type {((inputs?: Status_Mark_ClosedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Status_Mark_ClosedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_status_mark_closed(inputs)
	if (locale === "en-XA") return en_xa2_status_mark_closed(inputs)
	return en_status_mark_closed(inputs)
});