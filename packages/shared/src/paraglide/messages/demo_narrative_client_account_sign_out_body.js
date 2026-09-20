/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Sign_Out_BodyInputs */

const en_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Signing out deletes the session on the server, expires the browser's cookie, zeros all key material from memory, and returns the page to the sign in form. Unlike quick exit, signing out does not redirect to an external site or blank the tab title, because its purpose is to end the session normally rather than to conceal that the page was visited.`)
};

const es_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar sesión elimina la sesión en el servidor, expira la cookie del navegador, borra todo el material de claves de la memoria y devuelve la página al formulario de inicio de sesión. A diferencia de la salida rápida, cerrar sesión no redirige a un sitio externo ni borra el título de la pestaña, porque su propósito es terminar la sesión normalmente en lugar de ocultar que la página fue visitada.`)
};

const en_xa2_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgnìng òùt dèlètès thè sèssìòn òn thè sèrvèr, èxpìrès thè bròwsèr's còòkìè, zèròs àll kèy màtèrìàl fròm mèmòry, ànd rètùrns thè pàgè tò thè sìgn ìn fòrm. Ùnlìkè qùìck èxìt, sìgnìng òùt dòès nòt rèdìrèct tò àn èxtèrnàl sìtè òr blànk thè tàb tìtlè, bècàùsè ìts pùrpòsè ìs tò ènd thè sèssìòn nòrmàlly ràthèr thàn tò còncèàl thàt thè pàgè wàs vìsìtèd. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Signing out deletes the session on the server, expires the browser's cookie, zeros all key material from memory, and returns the page to the sign in form. Un..." |
*
* @param {Demo_Narrative_Client_Account_Sign_Out_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_sign_out_body = /** @type {((inputs?: Demo_Narrative_Client_Account_Sign_Out_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Sign_Out_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_sign_out_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_account_sign_out_body(inputs)
	return en_demo_narrative_client_account_sign_out_body(inputs)
});