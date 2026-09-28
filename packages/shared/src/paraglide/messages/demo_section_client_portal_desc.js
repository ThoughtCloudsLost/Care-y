/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Portal_DescInputs */

const en_demo_section_client_portal_desc = /** @type {(inputs: Demo_Section_Client_Portal_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The secure portal gives a client a private page to read and reply to messages from the organization. A user in the organization creates the link and hands it over by copy or by text. The credential that opens the page stays in the URL fragment, after the \`#\`, which browsers never include in server requests. Messages on the channel are encrypted with a key derived from that credential, and the server stores ciphertext it cannot open. The client can add a passphrase to guard the link. The client can also move to an account with a username and password without asking the organization. [The portal channel lifecycle](#deep-dive/portal-channel-lifecycle) covers how a channel is created, how it expires, and what each tier protects.`)
};

const es_demo_section_client_portal_desc = /** @type {(inputs: Demo_Section_Client_Portal_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El portal seguro ofrece al cliente una página privada para leer y responder mensajes de la organización. La persona usuaria en la organización crea el enlace y lo entrega por copia o por mensaje de texto. La credencial que abre la página viaja en el fragmento de la URL, que los navegadores nunca incluyen en las solicitudes al servidor. Los mensajes en el canal se cifran con una clave derivada de esa credencial, y el servidor almacena texto cifrado que no puede abrir. El cliente puede añadir una frase de paso para proteger el enlace. El cliente también puede pasar a una cuenta con nombre de usuario y contraseña sin pedirlo a la organización. [El ciclo de vida del canal del portal](#deep-dive/portal-channel-lifecycle) trata cómo se crea un canal, cómo expira y qué protege cada nivel.`)
};

const en_xa2_demo_section_client_portal_desc = /** @type {(inputs: Demo_Section_Client_Portal_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sècùrè pòrtàl gìvès à clìènt à prìvàtè pàgè tò rèàd ànd rèply tò mèssàgès fròm thè òrgànìzàtìòn. À ùsèr ìn thè òrgànìzàtìòn crèàtès thè lìnk ànd hànds ìt òvèr by còpy òr by tèxt. Thè crèdèntìàl thàt òpèns thè pàgè stàys ìn thè ÙRL fràgmènt, àftèr thè \`#\`, whìch bròwsèrs nèvèr ìnclùdè ìn sèrvèr rèqùèsts. Mèssàgès òn thè chànnèl àrè èncryptèd wìth à kèy dèrìvèd fròm thàt crèdèntìàl, ànd thè sèrvèr stòrès cìphèrtèxt ìt cànnòt òpèn. Thè clìènt càn àdd à pàssphràsè tò gùàrd thè lìnk. Thè clìènt càn àlsò mòvè tò àn àccòùnt wìth à ùsèrnàmè ànd pàsswòrd wìthòùt àskìng thè òrgànìzàtìòn. [Thè pòrtàl chànnèl lìfècyclè](#dèèp-dìvè/pòrtàl-chànnèl-lìfècyclè) còvèrs hòw à chànnèl ìs crèàtèd, hòw ìt èxpìrès, ànd whàt èàch tìèr pròtècts. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The secure portal gives a client a private page to read and reply to messages from the organization. A user in the organization creates the link and hands it..." |
*
* @param {Demo_Section_Client_Portal_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_portal_desc = /** @type {((inputs?: Demo_Section_Client_Portal_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Portal_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_portal_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_client_portal_desc(inputs)
	return en_demo_section_client_portal_desc(inputs)
});