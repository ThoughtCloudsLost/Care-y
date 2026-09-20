/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Write_Automatic_RepliesInputs */

const en_permission_write_automatic_replies = /** @type {(inputs: Permission_Write_Automatic_RepliesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Write automatic replies`)
};

const es_permission_write_automatic_replies = /** @type {(inputs: Permission_Write_Automatic_RepliesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribir respuestas automáticas`)
};

const en_xa2_permission_write_automatic_replies = /** @type {(inputs: Permission_Write_Automatic_RepliesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wrìtè àùtòmàtìc rèplìès •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Write automatic replies" |
*
* @param {Permission_Write_Automatic_RepliesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_write_automatic_replies = /** @type {((inputs?: Permission_Write_Automatic_RepliesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Write_Automatic_RepliesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_write_automatic_replies(inputs)
	if (locale === "en-XA") return en_xa2_permission_write_automatic_replies(inputs)
	return en_permission_write_automatic_replies(inputs)
});