/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Status_Mark_ActiveInputs */

const en_status_mark_active = /** @type {(inputs: Status_Mark_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Active`)
};

const es_status_mark_active = /** @type {(inputs: Status_Mark_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activo`)
};

/**
* | output |
* | --- |
* | "Active" |
*
* @param {Status_Mark_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const status_mark_active = /** @type {((inputs?: Status_Mark_ActiveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Status_Mark_ActiveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_status_mark_active(inputs)
	return es_status_mark_active(inputs)
});