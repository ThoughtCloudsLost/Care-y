/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Message_EditedInputs */

const en_portal_message_edited = /** @type {(inputs: Portal_Message_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`(edited)`)
};

const es_portal_message_edited = /** @type {(inputs: Portal_Message_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`(editado)`)
};

const en_xa2_portal_message_edited = /** @type {(inputs: Portal_Message_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦(èdìtèd) •••⟧`)
};

/**
* | output |
* | --- |
* | "(edited)" |
*
* @param {Portal_Message_EditedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_message_edited = /** @type {((inputs?: Portal_Message_EditedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Message_EditedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_message_edited(inputs)
	if (locale === "en-XA") return en_xa2_portal_message_edited(inputs)
	return en_portal_message_edited(inputs)
});