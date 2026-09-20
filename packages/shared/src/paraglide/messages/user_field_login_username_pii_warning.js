/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} User_Field_Login_Username_Pii_WarningInputs */

const en_user_field_login_username_pii_warning = /** @type {(inputs: User_Field_Login_Username_Pii_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server can never read login usernames, but signing in uses a per-organization fingerprint of the username, so someone holding the database could confirm a guessed username. Avoid real names or email addresses.`)
};

const es_user_field_login_username_pii_warning = /** @type {(inputs: User_Field_Login_Username_Pii_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor nunca puede leer los nombres de usuario, pero el inicio de sesión usa una huella digital del nombre de usuario por organización, por lo que alguien con acceso a la base de datos podría confirmar un nombre de usuario adivinado. Evita usar nombres reales o direcciones de correo electrónico.`)
};

const en_xa2_user_field_login_username_pii_warning = /** @type {(inputs: User_Field_Login_Username_Pii_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sèrvèr càn nèvèr rèàd lògìn ùsèrnàmès, bùt sìgnìng ìn ùsès à pèr-òrgànìzàtìòn fìngèrprìnt òf thè ùsèrnàmè, sò sòmèònè hòldìng thè dàtàbàsè còùld cònfìrm à gùèssèd ùsèrnàmè. Àvòìd rèàl nàmès òr èmàìl àddrèssès. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The server can never read login usernames, but signing in uses a per-organization fingerprint of the username, so someone holding the database could confirm ..." |
*
* @param {User_Field_Login_Username_Pii_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const user_field_login_username_pii_warning = /** @type {((inputs?: User_Field_Login_Username_Pii_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<User_Field_Login_Username_Pii_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_user_field_login_username_pii_warning(inputs)
	if (locale === "en-XA") return en_xa2_user_field_login_username_pii_warning(inputs)
	return en_user_field_login_username_pii_warning(inputs)
});