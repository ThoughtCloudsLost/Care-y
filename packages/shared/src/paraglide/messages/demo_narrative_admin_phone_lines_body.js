/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Phone_Lines_BodyInputs */

const en_demo_narrative_admin_phone_lines_body = /** @type {(inputs: Demo_Narrative_Admin_Phone_Lines_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each phone line has a number, a purpose role, and associated greetings. On a running CARE-Y server, phone lines connect to numbers provisioned through the telephony provider, with the outbound role handling calls that users initiate and the system messages role handling automated notifications. The demo seeds two fictional 555 numbers with purpose roles instead.
**Permissions.** Phone line configuration requires the Manage infrastructure permission.`)
};

const es_demo_narrative_admin_phone_lines_body = /** @type {(inputs: Demo_Narrative_Admin_Phone_Lines_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada línea telefónica tiene un número, un rol de propósito y saludos asociados. En un servidor CARE-Y en producción, las líneas se conectan a números aprovisionados a través del proveedor de telefonía, con el rol de saliente para las llamadas iniciadas por la persona usuaria y el rol de mensajes del sistema para las notificaciones automatizadas. La demo configura dos números ficticios 555 con roles de propósito en su lugar.
**Permisos.** La configuración de líneas telefónicas requiere el permiso Gestionar infraestructura.`)
};

/**
* | output |
* | --- |
* | "Each phone line has a number, a purpose role, and associated greetings. On a running CARE-Y server, phone lines connect to numbers provisioned through the te..." |
*
* @param {Demo_Narrative_Admin_Phone_Lines_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_phone_lines_body = /** @type {((inputs?: Demo_Narrative_Admin_Phone_Lines_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Phone_Lines_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_phone_lines_body(inputs)
	return en_demo_narrative_admin_phone_lines_body(inputs)
});