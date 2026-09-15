/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Settings_BodyInputs */

const en_demo_narrative_client_account_settings_body = /** @type {(inputs: Demo_Narrative_Client_Account_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The account page keeps its controls in the drawer rather than inline on the page, and the drawer is empty until the client signs in.
**Encryption.** The contact info card fetches a sealed envelope from the server and decrypts it in the browser, so what the client sees is the plaintext phone and email while the server only ever held ciphertext.
**When it appears.** After sign in the drawer holds four entries for viewing contact info, submitting a contact correction, opening the change password sheet, and signing out.`)
};

const es_demo_narrative_client_account_settings_body = /** @type {(inputs: Demo_Narrative_Client_Account_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de cuenta mantiene sus controles en el cajón en lugar de mostrarlos directamente en la página, y el cajón permanece vacío hasta que el cliente inicia sesión.
**Cifrado.** La tarjeta de información de contacto obtiene un sobre sellado del servidor y lo descifra en el navegador, de modo que lo que el cliente ve es el teléfono y correo en texto plano mientras el servidor solo guardó texto cifrado.
**Cuándo aparece.** Después de iniciar sesión el cajón contiene cuatro entradas para ver la información de contacto, enviar una corrección de contacto, abrir la hoja de cambio de contraseña y cerrar sesión.`)
};

/**
* | output |
* | --- |
* | "The account page keeps its controls in the drawer rather than inline on the page, and the drawer is empty until the client signs in. **Encryption.** The cont..." |
*
* @param {Demo_Narrative_Client_Account_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_settings_body = /** @type {((inputs?: Demo_Narrative_Client_Account_Settings_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Settings_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_settings_body(inputs)
	return en_demo_narrative_client_account_settings_body(inputs)
});