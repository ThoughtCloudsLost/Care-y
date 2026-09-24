/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Create_Warning_ResetInputs */

const en_account_create_warning_reset = /** @type {(inputs: Account_Create_Warning_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If your password is ever reset, your message history is permanently lost. There is no way to get it back.`)
};

const es_account_create_warning_reset = /** @type {(inputs: Account_Create_Warning_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si tu contraseña se restablece, el historial de mensajes se pierde de forma permanente. No hay manera de recuperarlo.`)
};

const en_xa2_account_create_warning_reset = /** @type {(inputs: Account_Create_Warning_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìf yòùr pàsswòrd ìs èvèr rèsèt, yòùr mèssàgè hìstòry ìs pèrmànèntly lòst. Thèrè ìs nò wày tò gèt ìt bàck. ••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "If your password is ever reset, your message history is permanently lost. There is no way to get it back." |
*
* @param {Account_Create_Warning_ResetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_create_warning_reset = /** @type {((inputs?: Account_Create_Warning_ResetInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Create_Warning_ResetInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_create_warning_reset(inputs)
	if (locale === "en-XA") return en_xa2_account_create_warning_reset(inputs)
	return en_account_create_warning_reset(inputs)
});