/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_Org_BodyInputs */

const en_demo_narrative_admin_hub_org_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Org_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Settings that shape the whole workspace: general info, branding, terminology, encryption keys, data retention, note types, and intake form management. General info and branding are stored without encryption so pages visible before sign-in can display them. Terminology and note types are encrypted with the organization key.`)
};

const es_demo_narrative_admin_hub_org_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Org_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ajustes que dan forma a todo el espacio de trabajo: información general, marca, terminología, claves de cifrado, retención de datos, tipos de notas y gestión de formularios de admisión. La información general y la marca se almacenan sin cifrar para que las páginas visibles antes de iniciar sesión puedan mostrarlas. La terminología y los tipos de notas se cifran con la clave de la organización.`)
};

/**
* | output |
* | --- |
* | "Settings that shape the whole workspace: general info, branding, terminology, encryption keys, data retention, note types, and intake form management. Genera..." |
*
* @param {Demo_Narrative_Admin_Hub_Org_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_org_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_Org_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_Org_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_org_body(inputs)
	return en_demo_narrative_admin_hub_org_body(inputs)
});