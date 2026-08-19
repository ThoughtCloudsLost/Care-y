/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Telephony_Provider_BodyInputs */

const en_demo_narrative_admin_telephony_provider_body = /** @type {(inputs: Demo_Narrative_Admin_Telephony_Provider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The telephony section starts with how the organization connects to its phone provider.
**Two modes.** In managed mode the numbers are provisioned for the organization. In bring your own telephony mode the organization connects its existing provider account with its own credentials and keeps direct ownership of its numbers.
**Credentials.** The provider account ID is displayed masked, and credentials are updated through a dedicated sheet. A refresh action re-reads the number inventory from the provider, and switching modes asks for confirmation because it changes how every line is provisioned.
**Number roles.** An editor assigns which number handles outbound calls and which sends system messages.`)
};

const es_demo_narrative_admin_telephony_provider_body = /** @type {(inputs: Demo_Narrative_Admin_Telephony_Provider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La seccion de telefonia comienza con como la organizacion se conecta a su proveedor de telefono.
**Dos modos.** En modo gestionado los numeros se aprovisionan para la organizacion. En modo de telefonia propia la organizacion conecta su cuenta de proveedor existente con sus propias credenciales y mantiene la propiedad directa de sus numeros.
**Credenciales.** El ID de cuenta del proveedor se muestra enmascarado, y las credenciales se actualizan a traves de una hoja dedicada. Una accion de actualizar relee el inventario de numeros del proveedor, y cambiar de modo pide confirmacion porque cambia como se aprovisiona cada linea.
**Roles de numeros.** Un editor asigna que numero maneja las llamadas salientes y cual envia mensajes del sistema.`)
};

/**
* | output |
* | --- |
* | "The telephony section starts with how the organization connects to its phone provider. **Two modes.** In managed mode the numbers are provisioned for the org..." |
*
* @param {Demo_Narrative_Admin_Telephony_Provider_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_telephony_provider_body = /** @type {((inputs?: Demo_Narrative_Admin_Telephony_Provider_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Telephony_Provider_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_telephony_provider_body(inputs)
	return es_demo_narrative_admin_telephony_provider_body(inputs)
});