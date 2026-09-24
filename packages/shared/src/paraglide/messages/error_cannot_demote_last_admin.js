/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Cannot_Demote_Last_AdminInputs */

const en_error_cannot_demote_last_admin = /** @type {(inputs: Error_Cannot_Demote_Last_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cannot demote the last admin.`)
};

const es_error_cannot_demote_last_admin = /** @type {(inputs: Error_Cannot_Demote_Last_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se puede degradar al último administrador.`)
};

const en_xa2_error_cannot_demote_last_admin = /** @type {(inputs: Error_Cannot_Demote_Last_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cànnòt dèmòtè thè làst àdmìn. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Cannot demote the last admin." |
*
* @param {Error_Cannot_Demote_Last_AdminInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_cannot_demote_last_admin = /** @type {((inputs?: Error_Cannot_Demote_Last_AdminInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Cannot_Demote_Last_AdminInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_cannot_demote_last_admin(inputs)
	if (locale === "en-XA") return en_xa2_error_cannot_demote_last_admin(inputs)
	return en_error_cannot_demote_last_admin(inputs)
});