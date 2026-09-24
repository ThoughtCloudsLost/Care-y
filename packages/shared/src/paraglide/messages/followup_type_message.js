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

const en_xa2_followup_type_message = /** @type {(inputs: Followup_Type_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèssàgès •••⟧`)
};

/**
* | output |
* | --- |
* | "Messages" |
*
* @param {Followup_Type_MessageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_message = /** @type {((inputs?: Followup_Type_MessageInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_MessageInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_followup_type_message(inputs)
	if (locale === "en-XA") return en_xa2_followup_type_message(inputs)
	return en_followup_type_message(inputs)
});