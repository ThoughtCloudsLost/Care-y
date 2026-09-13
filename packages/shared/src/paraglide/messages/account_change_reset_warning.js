/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Change_Reset_WarningInputs */

const en_account_change_reset_warning = /** @type {(inputs: Account_Change_Reset_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If you ever forget your password and it gets reset, your message history is lost. Changing it here keeps everything.`)
};

const es_account_change_reset_warning = /** @type {(inputs: Account_Change_Reset_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si alguna vez olvidas tu contraseña y se restablece, tu historial de mensajes se pierde. Cambiarla aquí conserva todo.`)
};

/**
* | output |
* | --- |
* | "If you ever forget your password and it gets reset, your message history is lost. Changing it here keeps everything." |
*
* @param {Account_Change_Reset_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_change_reset_warning = /** @type {((inputs?: Account_Change_Reset_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Change_Reset_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_change_reset_warning(inputs)
	return es_account_change_reset_warning(inputs)
});