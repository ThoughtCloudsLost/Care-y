/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Comms_DescInputs */

const en_demo_section_admin_comms_desc = /** @type {(inputs: Demo_Section_Admin_Comms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The communications page configures how the organization talks to clients by phone and text. It covers phone lines and their greetings, SMS templates, the blocklist, and the voicemail quarantine where recordings from unknown callers wait for review. A row of section buttons under the title jumps to any of them.`)
};

const es_demo_section_admin_comms_desc = /** @type {(inputs: Demo_Section_Admin_Comms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de comunicaciones configura cómo la organización se comunica con los clientes por teléfono y mensajes de texto. Cubre las líneas telefónicas y sus saludos, las plantillas de SMS, la lista de bloqueo y la cuarentena de mensajes de voz donde las grabaciones de llamantes desconocidos esperan revisión. Una fila de botones de sección debajo del título salta a cualquiera de ellos.`)
};

/**
* | output |
* | --- |
* | "The communications page configures how the organization talks to clients by phone and text. It covers phone lines and their greetings, SMS templates, the blo..." |
*
* @param {Demo_Section_Admin_Comms_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_comms_desc = /** @type {((inputs?: Demo_Section_Admin_Comms_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Comms_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_admin_comms_desc(inputs)
	return es_demo_section_admin_comms_desc(inputs)
});