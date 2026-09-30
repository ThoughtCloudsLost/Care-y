/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Share_DescInputs */

const en_demo_section_client_share_desc = /** @type {(inputs: Demo_Section_Client_Share_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A share link delivers one encrypted message to a reader who has no account in the system. The decryption key sits in the URL fragment, which browsers never include in server requests. The link stops working after one read or after 72 hours, whichever comes first. When the link travels by text message, the carrier and the telephony provider see the full address, key included. [How encryption works](#deep-dive/how-encryption-works) covers the sealing model, and [Single use access](#client-share/one-time) covers what happens after the first read.`)
};

const es_demo_section_client_share_desc = /** @type {(inputs: Demo_Section_Client_Share_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un enlace compartido entrega un mensaje cifrado a una persona lectora que no tiene cuenta en el sistema. La clave de descifrado está en el fragmento de la URL, que los navegadores nunca incluyen en las solicitudes al servidor. El enlace deja de funcionar tras una lectura o tras 72 horas, lo que ocurra primero. Cuando el enlace viaja por mensaje de texto, el operador y el proveedor de telefonía ven la dirección completa, clave incluida. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata el modelo de sellado, y [Acceso de un solo uso](#client-share/one-time) trata lo que ocurre tras la primera lectura.`)
};

const en_xa2_demo_section_client_share_desc = /** @type {(inputs: Demo_Section_Client_Share_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À shàrè lìnk dèlìvèrs ònè èncryptèd mèssàgè tò à rèàdèr whò hàs nò àccòùnt ìn thè systèm. Thè dècryptìòn kèy sìts ìn thè ÙRL fràgmènt, whìch bròwsèrs nèvèr ìnclùdè ìn sèrvèr rèqùèsts. Thè lìnk stòps wòrkìng àftèr ònè rèàd òr àftèr 72 hòùrs, whìchèvèr còmès fìrst. Whèn thè lìnk tràvèls by tèxt mèssàgè, thè càrrìèr ànd thè tèlèphòny pròvìdèr sèè thè fùll àddrèss, kèy ìnclùdèd. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè sèàlìng mòdèl, ànd [Sìnglè ùsè àccèss](#clìènt-shàrè/ònè-tìmè) còvèrs whàt hàppèns àftèr thè fìrst rèàd. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A share link delivers one encrypted message to a reader who has no account in the system. The decryption key sits in the URL fragment, which browsers never i..." |
*
* @param {Demo_Section_Client_Share_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_share_desc = /** @type {((inputs?: Demo_Section_Client_Share_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Share_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_share_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_client_share_desc(inputs)
	return en_demo_section_client_share_desc(inputs)
});