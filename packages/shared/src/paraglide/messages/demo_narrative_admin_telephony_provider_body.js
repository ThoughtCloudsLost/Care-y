/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Telephony_Provider_BodyInputs */

const en_demo_narrative_admin_telephony_provider_body = /** @type {(inputs: Demo_Narrative_Admin_Telephony_Provider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The provider connection is how an organization reaches a phone network, under one of two arrangements. Bring your own telephony means the organization keeps its own provider account and hands CARE-Y the credentials for it; managed telephony means the numbers are provisioned for the organization by whoever runs the deployment. Both need permission to manage infrastructure. [[#telephony #permissions]]
**Why the server can read these and reads nothing else.** Provider credentials are operational secrets rather than case content, and the server has to present them to the provider on every call and message, so they are encrypted under the server's operational key and decrypted in memory at the moment of use, which the code marks as the credential exception to its no-server-decrypt rule. Nothing a client said moves through that key. [The telephony relay](#deep-dive/the-telephony-relay) covers what the provider learns during a call. [[#keys #trust-boundary]]
**What the credential row holds.** One row for each organization on the platform database, carrying the provider name in plaintext, the sealed configuration and the two timestamps. The account identifier, the token and the organization's provisioned numbers are inside the sealed configuration, so the organization's own phone numbers are absent from its tenant schema. A dump taken without the operational key gives the provider name and when the credentials last changed. [The organization keys](#admin-org/keys) covers the key the rest of the product uses. [[#server-holds #metadata]]
**Saving, masking and switching.** A save is validated against the provider's schema before anything is stored, and the section is answered afterwards with a masked account identifier and a fixed run of dots in place of the token, so the stored token is never sent back. Switching to managed telephony deletes the row, which is why the organization's credentials stop existing on the server rather than sitting unused. [[#encryption]]
**The config service and its cache.** \`packages/server/src/telephony/config-service.ts\` holds the encrypt, decrypt and upsert path and \`packages/server/src/telephony/factory.ts\` builds one provider instance for each organization and caches it, so a save or a mode change invalidates that entry. A provider id the server has no implementation for fails closed at the factory rather than at the call. [[#failure-states]]`)
};

const es_demo_narrative_admin_telephony_provider_body = /** @type {(inputs: Demo_Narrative_Admin_Telephony_Provider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La conexión con el proveedor es la forma en que una organización llega a una red telefónica, bajo uno de dos arreglos. La telefonía propia significa que la organización conserva su cuenta de proveedor y entrega a CARE-Y las credenciales de esa cuenta; la telefonía gestionada significa que los números los aprovisiona para la organización quien administra la instalación. Ambos requieren permiso para gestionar la infraestructura. [[#telephony #permissions]]
**Por qué el servidor puede leer estas credenciales y nada más.** Las credenciales del proveedor son secretos operativos y no contenido de casos, y el servidor tiene que presentarlas al proveedor en cada llamada y cada mensaje, así que se cifran con la clave operativa del servidor y se descifran en memoria en el momento de usarlas, lo que el código marca como la excepción de credenciales a su regla de no descifrar en el servidor. Nada de lo que dijo un cliente pasa por esa clave. [El relé de telefonía](#deep-dive/the-telephony-relay) trata lo que el proveedor llega a saber durante una llamada. [[#keys #trust-boundary]]
**Lo que guarda la fila de credenciales.** Una fila por organización en la base de datos de plataforma, con el nombre del proveedor en texto plano, la configuración sellada y las dos marcas de tiempo. El identificador de cuenta, el token y los números aprovisionados de la organización están dentro de la configuración sellada, de modo que los números de teléfono propios de la organización no figuran en su esquema de inquilino. Un volcado tomado sin la clave operativa da el nombre del proveedor y cuándo cambiaron las credenciales por última vez. [Las claves de la organización](#admin-org/keys) trata la clave que usa el resto del producto. [[#server-holds #metadata]]
**Guardar, enmascarar y cambiar de arreglo.** Un guardado se valida contra el esquema del proveedor antes de almacenar nada, y después la sección recibe el identificador de cuenta enmascarado y una serie fija de puntos en lugar del token, así que el token almacenado nunca se devuelve. Cambiar a telefonía gestionada elimina la fila, y por eso las credenciales de la organización dejan de existir en el servidor en vez de quedarse sin uso. [[#encryption]]
**El servicio de configuración y su caché.** \`packages/server/src/telephony/config-service.ts\` tiene la ruta de cifrado, descifrado y escritura, y \`packages/server/src/telephony/factory.ts\` construye una instancia de proveedor para cada organización y la guarda en caché, de modo que un guardado o un cambio de arreglo invalida esa entrada. Un identificador de proveedor sin implementación en el servidor falla de forma cerrada en la fábrica y no en la llamada. [[#failure-states]]`)
};

const en_xa2_demo_narrative_admin_telephony_provider_body = /** @type {(inputs: Demo_Narrative_Admin_Telephony_Provider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tèlèphòny pròvìdèr sèctìòn cònfìgùrès hòw thè òrgànìzàtìòn cònnècts tò ìts phònè sèrvìcè.
 •••••••••••••••••••••••••••••**Twò mòdès. •••** Ìn mànàgèd mòdè thè nùmbèrs àrè pròvìsìònèd fòr thè òrgànìzàtìòn. Ìn brìng yòùr òwn tèlèphòny mòdè thè òrgànìzàtìòn cònnècts ìts èxìstìng pròvìdèr àccòùnt wìth ìts òwn crèdèntìàls ànd kèèps dìrèct òwnèrshìp òf ìts nùmbèrs.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Pròvìdèr crèdèntìàls àrè èncryptèd wìth àn òpèràtìònàl kèy òn thè sèrvèr bèfòrè stòràgè, sò thè dàtàbàsè hòlds cìphèrtèxt ràthèr thàn à plàìntèxt ÀPÌ tòkèn. Thè sèrvèr dècrypts thèm àt càll tìmè tò rèàch thè pròvìdèr òn thè òrgànìzàtìòn's bèhàlf.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Thè tèlèphòny pròvìdèr sèctìòn rèqùìrès thè Mànàgè ìnfràstrùctùrè pèrmìssìòn. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The provider connection is how an organization reaches a phone network, under one of two arrangements. Bring your own telephony means the organization keeps ..." |
*
* @param {Demo_Narrative_Admin_Telephony_Provider_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_telephony_provider_body = /** @type {((inputs?: Demo_Narrative_Admin_Telephony_Provider_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Telephony_Provider_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_telephony_provider_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_telephony_provider_body(inputs)
	return en_demo_narrative_admin_telephony_provider_body(inputs)
});