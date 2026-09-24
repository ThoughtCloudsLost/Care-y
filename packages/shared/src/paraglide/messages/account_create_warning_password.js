/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Create_Warning_PasswordInputs */

const en_account_create_warning_password = /** @type {(inputs: Account_Create_Warning_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`There is no way to recover this password. Write it down somewhere safe or use a password manager.`)
};

const es_account_create_warning_password = /** @type {(inputs: Account_Create_Warning_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay forma de recuperar esta contraseña. Anótala en un lugar seguro o usa un gestor de contraseñas.`)
};

const en_xa2_account_create_warning_password = /** @type {(inputs: Account_Create_Warning_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thèrè ìs nò wày tò rècòvèr thìs pàsswòrd. Wrìtè ìt dòwn sòmèwhèrè sàfè òr ùsè à pàsswòrd mànàgèr. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "There is no way to recover this password. Write it down somewhere safe or use a password manager." |
*
* @param {Account_Create_Warning_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_create_warning_password = /** @type {((inputs?: Account_Create_Warning_PasswordInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Create_Warning_PasswordInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_create_warning_password(inputs)
	if (locale === "en-XA") return en_xa2_account_create_warning_password(inputs)
	return en_account_create_warning_password(inputs)
});