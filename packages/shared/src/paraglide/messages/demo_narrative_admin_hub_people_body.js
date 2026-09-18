/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_People_BodyInputs */

const en_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The user roster, queue configuration, and client list. User identifiers and queue names are encrypted with the organization key before storage. Client identifiers are encrypted separately, and full contact details are gated by the View client PII permission.`)
};

const es_demo_narrative_admin_hub_people_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El listado de personas usuarias, la configuración de colas y la lista de clientes. Los identificadores de personas usuarias y los nombres de colas se cifran con la clave de la organización antes de almacenarse. Los identificadores de clientes se cifran por separado, y los datos de contacto completos están protegidos por el permiso Ver PII de clientes.`)
};

/**
* | output |
* | --- |
* | "The user roster, queue configuration, and client list. User identifiers and queue names are encrypted with the organization key before storage. Client identi..." |
*
* @param {Demo_Narrative_Admin_Hub_People_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_people_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_People_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_People_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_people_body(inputs)
	return en_demo_narrative_admin_hub_people_body(inputs)
});