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

/**
* | output |
* | --- |
* | "The telephony provider section configures how the organization connects to its phone service. **Two modes.** In managed mode the numbers are provisioned for ..." |
*
* @param {Demo_Narrative_Admin_Telephony_Provider_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_telephony_provider_body = /** @type {((inputs?: Demo_Narrative_Admin_Telephony_Provider_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Telephony_Provider_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_telephony_provider_body(inputs)
	return en_demo_narrative_admin_telephony_provider_body(inputs)
});