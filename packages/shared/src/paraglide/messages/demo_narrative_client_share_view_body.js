/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Share_View_BodyInputs */

const en_demo_narrative_client_share_view_body = /** @type {(inputs: Demo_Narrative_Client_Share_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When someone opens a share link, the page fetches the encrypted content from the server and decrypts it in the browser.
**How the link works.** The share ID is in the URL path, and the decryption key is in the URL fragment, which the browser never sends to the server. The server sends the encrypted content without being able to read it. After the page reads the fragment it strips the key from the address bar so it does not persist in browser history or appear if the URL is copied.
**Security tradeoff.** The decrypted text sits in the device's memory as a value that cannot be reliably erased the way an encryption key can. Quick exit drops it and navigates away, but unlike keys there is no zeroing step that guarantees it is gone.`)
};

const es_demo_narrative_client_share_view_body = /** @type {(inputs: Demo_Narrative_Client_Share_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando alguien abre un enlace compartido, la página obtiene el contenido cifrado del servidor y lo descifra en el navegador.
**Cómo funciona el enlace.** El identificador de compartición está en la ruta de la URL, y la clave de descifrado está en el fragmento de la URL, que el navegador nunca envía al servidor. El servidor envía el contenido cifrado sin poder leerlo. Después de que la página lee el fragmento elimina la clave de la barra de direcciones para que no persista en el historial del navegador ni aparezca si se copia la URL.
**Compromiso de seguridad.** El texto descifrado permanece en la memoria del dispositivo como un valor que no puede borrarse de forma fiable como sí se borra una clave de cifrado. La salida rápida lo descarta y navega fuera de la página, pero a diferencia de las claves no existe un paso de borrado que garantice su eliminación.`)
};

const en_xa2_demo_narrative_client_share_view_body = /** @type {(inputs: Demo_Narrative_Client_Share_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn sòmèònè òpèns à shàrè lìnk, thè pàgè fètchès thè èncryptèd còntènt fròm thè sèrvèr ànd dècrypts ìt ìn thè bròwsèr.
 ••••••••••••••••••••••••••••••••••••**Hòw thè lìnk wòrks. ••••••** Thè shàrè ÌD ìs ìn thè ÙRL pàth, ànd thè dècryptìòn kèy ìs ìn thè ÙRL fràgmènt, whìch thè bròwsèr nèvèr sènds tò thè sèrvèr. Thè sèrvèr sènds thè èncryptèd còntènt wìthòùt bèìng àblè tò rèàd ìt. Àftèr thè pàgè rèàds thè fràgmènt ìt strìps thè kèy fròm thè àddrèss bàr sò ìt dòès nòt pèrsìst ìn bròwsèr hìstòry òr àppèàr ìf thè ÙRL ìs còpìèd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sècùrìty tràdèòff. ••••••** Thè dècryptèd tèxt sìts ìn thè dèvìcè's mèmòry às à vàlùè thàt cànnòt bè rèlìàbly èràsèd thè wày àn èncryptìòn kèy càn. Qùìck èxìt dròps ìt ànd nàvìgàtès àwày, bùt ùnlìkè kèys thèrè ìs nò zèròìng stèp thàt gùàràntèès ìt ìs gònè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When someone opens a share link, the page fetches the encrypted content from the server and decrypts it in the browser. **How the link works.** The share ID ..." |
*
* @param {Demo_Narrative_Client_Share_View_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_view_body = /** @type {((inputs?: Demo_Narrative_Client_Share_View_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Share_View_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_share_view_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_share_view_body(inputs)
	return en_demo_narrative_client_share_view_body(inputs)
});