/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Account_DescInputs */

const en_demo_section_client_account_desc = /** @type {(inputs: Demo_Section_Client_Account_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A client account gives a returning person durable access to their conversation thread without needing a new link each time. The account uses a username and password that derive encryption keys through the same key derivation pipeline volunteers use on the sign in page.`)
};

const es_demo_section_client_account_desc = /** @type {(inputs: Demo_Section_Client_Account_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una cuenta de cliente otorga a una persona que regresa acceso duradero a su hilo de conversación sin necesitar un nuevo enlace cada vez. La cuenta usa un nombre de usuario y contraseña que derivan claves de cifrado a través del mismo proceso de derivación que se usa en la página de inicio de sesión de voluntarios.`)
};

/**
* | output |
* | --- |
* | "A client account gives a returning person durable access to their conversation thread without needing a new link each time. The account uses a username and p..." |
*
* @param {Demo_Section_Client_Account_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_account_desc = /** @type {((inputs?: Demo_Section_Client_Account_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Account_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_account_desc(inputs)
	return en_demo_section_client_account_desc(inputs)
});