/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_MessageInputs */

const en_followup_type_message = /** @type {(inputs: Followup_Type_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Messages`)
};

const es_followup_type_message = /** @type {(inputs: Followup_Type_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensajes`)
};

/**
* | output |
* | --- |
* | "Messages" |
*
* @param {Followup_Type_MessageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_message = /** @type {((inputs?: Followup_Type_MessageInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_MessageInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_message(inputs)
	return es_followup_type_message(inputs)
});