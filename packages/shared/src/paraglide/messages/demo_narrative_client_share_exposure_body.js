/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Share_Exposure_BodyInputs */

const en_demo_narrative_client_share_exposure_body = /** @type {(inputs: Demo_Narrative_Client_Share_Exposure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The share page tells the reader that the link carried the decryption key, that the server cannot read the content, and that the link works only once. The notice appears when decrypted content loads and stays until the reader dismisses it. [[#privacy #portal]]
**What does the server see?** The server receives the share's ID and the address of the request. The key is in the URL fragment, which browsers never send to a server. The server hands back scrambled data it cannot read. Nothing in the request ties the reader to any other conversation with the organization. [[#server-holds #metadata]]
**What does the notice not cover?** When the link is sent by text message, the carrier and the telephony provider handling delivery can read the full address, decryption key included. Single use protects against interception after the reader has already opened the link. Interception before that first read still yields a working key. [The telephony relay](#deep-dive/the-telephony-relay) covers what those intermediaries retain. [[#telephony #trust-boundary]]
**The sender's warning.** The user who created the link sees a warning when choosing the text channel, naming the same exposure. [Channel warnings](#ticket-detail/exposure-hints) covers the full set of channel notices. [Share link status](#ticket-detail/share-status) covers what the sender learns after the link is sent. [[#telephony #privacy]]
**The hint component.** \`PortalHint.svelte\` in \`packages/client/src/lib/shell/\` renders a notice on four client surfaces. The share page passes its own message and raises the hint on the transition to decrypted content. [[#portal #privacy]]`)
};

const es_demo_narrative_client_share_exposure_body = /** @type {(inputs: Demo_Narrative_Client_Share_Exposure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página compartida informa al lector que el enlace llevaba la clave de descifrado, que el servidor no puede leer el contenido y que el enlace funciona una sola vez. El aviso aparece cuando se carga el contenido descifrado y permanece hasta que el lector lo cierra. [[#privacy #portal]]
**¿Qué ve el servidor?** El servidor recibe el identificador del enlace compartido y la dirección de la solicitud. La clave está en el fragmento de la URL, que los navegadores nunca envían al servidor. El servidor devuelve datos cifrados que no puede leer. Nada en la solicitud vincula al lector con ninguna otra conversación con la organización. [[#server-holds #metadata]]
**¿Qué no cubre el aviso?** Cuando el enlace se envía por mensaje de texto, el operador de telefonía y el proveedor que gestionan la entrega pueden leer la dirección completa, incluida la clave de descifrado. El uso único protege contra una interceptación posterior a la apertura del enlace. Una interceptación anterior a esa primera lectura todavía contiene una clave válida. [El relay de telefonía](#deep-dive/the-telephony-relay) trata lo que esos intermediarios conservan. [[#telephony #trust-boundary]]
**El aviso del remitente.** La persona usuaria que creó el enlace ve un aviso al elegir el canal de texto, nombrando la misma exposición. [Avisos de canal](#ticket-detail/exposure-hints) trata el conjunto completo de avisos de canal. [Estado del enlace compartido](#ticket-detail/share-status) trata lo que el remitente conoce después del envío. [[#telephony #privacy]]
**El componente del aviso.** \`PortalHint.svelte\` en \`packages/client/src/lib/shell/\` muestra un aviso en cuatro superficies del cliente. La página compartida pasa su propio mensaje y lo activa en la transición al contenido descifrado. [[#portal #privacy]]`)
};

const en_xa2_demo_narrative_client_share_exposure_body = /** @type {(inputs: Demo_Narrative_Client_Share_Exposure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè shàrè pàgè tèlls thè rèàdèr thàt thè lìnk càrrìèd thè dècryptìòn kèy, thàt thè sèrvèr cànnòt rèàd thè còntènt, ànd thàt thè lìnk wòrks ònly òncè. Thè nòtìcè àppèàrs whèn dècryptèd còntènt lòàds ànd stàys ùntìl thè rèàdèr dìsmìssès ìt. [[#prìvàcy #pòrtàl]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr sèè? ••••••••** Thè sèrvèr rècèìvès thè shàrè's ÌD ànd thè àddrèss òf thè rèqùèst. Thè kèy ìs ìn thè ÙRL fràgmènt, whìch bròwsèrs nèvèr sènd tò à sèrvèr. Thè sèrvèr hànds bàck scràmblèd dàtà ìt cànnòt rèàd. Nòthìng ìn thè rèqùèst tìès thè rèàdèr tò àny òthèr cònvèrsàtìòn wìth thè òrgànìzàtìòn. [[#sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè nòtìcè nòt còvèr? ••••••••••** Whèn thè lìnk ìs sènt by tèxt mèssàgè, thè càrrìèr ànd thè tèlèphòny pròvìdèr hàndlìng dèlìvèry càn rèàd thè fùll àddrèss, dècryptìòn kèy ìnclùdèd. Sìnglè ùsè pròtècts àgàìnst ìntèrcèptìòn àftèr thè rèàdèr hàs àlrèàdy òpènèd thè lìnk. Ìntèrcèptìòn bèfòrè thàt fìrst rèàd stìll yìèlds à wòrkìng kèy. [Thè tèlèphòny rèlày](#dèèp-dìvè/thè-tèlèphòny-rèlày) còvèrs whàt thòsè ìntèrmèdìàrìès rètàìn. [[#tèlèphòny #trùst-bòùndàry]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè sèndèr's wàrnìng. •••••••** Thè ùsèr whò crèàtèd thè lìnk sèès à wàrnìng whèn chòòsìng thè tèxt chànnèl, nàmìng thè sàmè èxpòsùrè. [Chànnèl wàrnìngs](#tìckèt-dètàìl/èxpòsùrè-hìnts) còvèrs thè fùll sèt òf chànnèl nòtìcès. [Shàrè lìnk stàtùs](#tìckèt-dètàìl/shàrè-stàtùs) còvèrs whàt thè sèndèr lèàrns àftèr thè lìnk ìs sènt. [[#tèlèphòny #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè hìnt còmpònènt. ••••••** \`PòrtàlHìnt.svèltè\` ìn \`pàckàgès/clìènt/src/lìb/shèll/\` rèndèrs à nòtìcè òn fòùr clìènt sùrfàcès. Thè shàrè pàgè pàssès ìts òwn mèssàgè ànd ràìsès thè hìnt òn thè trànsìtìòn tò dècryptèd còntènt. [[#pòrtàl #prìvàcy]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The share page tells the reader that the link carried the decryption key, that the server cannot read the content, and that the link works only once. The not..." |
*
* @param {Demo_Narrative_Client_Share_Exposure_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_exposure_body = /** @type {((inputs?: Demo_Narrative_Client_Share_Exposure_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Share_Exposure_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_share_exposure_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_share_exposure_body(inputs)
	return en_demo_narrative_client_share_exposure_body(inputs)
});