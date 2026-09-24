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

const en_xa2_demo_narrative_client_account_settings_body = /** @type {(inputs: Demo_Narrative_Client_Account_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè àccòùnt pàgè kèèps ìts còntròls ìn thè dràwèr ràthèr thàn ìnlìnè òn thè pàgè, ànd thè dràwèr ìs èmpty ùntìl thè clìènt sìgns ìn.
 ••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Thè còntàct ìnfò càrd fètchès à sèàlèd ènvèlòpè fròm thè sèrvèr ànd dècrypts ìt ìn thè bròwsèr, sò whàt thè clìènt sèès ìs thè plàìntèxt phònè ànd èmàìl whìlè thè sèrvèr ònly èvèr hèld cìphèrtèxt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn ìt àppèàrs. •••••** Àftèr sìgn ìn thè dràwèr hòlds fòùr èntrìès fòr vìèwìng còntàct ìnfò, sùbmìttìng à còntàct còrrèctìòn, òpènìng thè chàngè pàsswòrd shèèt, ànd sìgnìng òùt. •••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The account page keeps its controls in the drawer rather than inline on the page, and the drawer is empty until the client signs in. **Encryption.** The cont..." |
*
* @param {Demo_Narrative_Client_Account_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_settings_body = /** @type {((inputs?: Demo_Narrative_Client_Account_Settings_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Settings_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_settings_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_account_settings_body(inputs)
	return en_demo_narrative_client_account_settings_body(inputs)
});