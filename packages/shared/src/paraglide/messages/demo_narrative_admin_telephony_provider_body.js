/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Telephony_Provider_BodyInputs */

const en_demo_narrative_admin_telephony_provider_body = /** @type {(inputs: Demo_Narrative_Admin_Telephony_Provider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The telephony provider section configures how the organization connects to its phone service.
**Two modes.** In managed mode the numbers are provisioned for the organization. In bring your own telephony mode the organization connects its existing provider account with its own credentials and keeps direct ownership of its numbers.
**What the server holds.** Provider credentials are encrypted with an operational key on the server before storage, so the database holds ciphertext rather than a plaintext API token. The server decrypts them at call time to reach the provider on the organization's behalf.
**Permissions.** The telephony provider section requires the Manage infrastructure permission.`)
};

const es_demo_narrative_admin_telephony_provider_body = /** @type {(inputs: Demo_Narrative_Admin_Telephony_Provider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección del proveedor de telefonía configura cómo la organización se conecta a su servicio telefónico.
**Dos modos.** En modo gestionado los números se aprovisionan para la organización. En modo de telefonía propia la organización conecta su cuenta de proveedor existente con sus propias credenciales y mantiene la propiedad directa de sus números.
**Lo que almacena el servidor.** Las credenciales del proveedor se cifran con una clave operativa en el servidor antes de almacenarse, de modo que la base de datos contiene texto cifrado en lugar de un token de API en texto plano. El servidor las descifra en el momento de la llamada para contactar al proveedor en nombre de la organización.
**Permisos.** La sección del proveedor de telefonía requiere el permiso Gestionar infraestructura.`)
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
* | "The telephony provider section configures how the organization connects to its phone service. **Two modes.** In managed mode the numbers are provisioned for ..." |
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