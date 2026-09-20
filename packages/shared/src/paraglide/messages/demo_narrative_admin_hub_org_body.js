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

const en_xa2_demo_narrative_admin_hub_org_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Org_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèttìngs thàt shàpè thè whòlè wòrkspàcè: gènèràl ìnfò, bràndìng, tèrmìnòlògy, èncryptìòn kèys, dàtà rètèntìòn, nòtè typès, ànd ìntàkè fòrm mànàgèmènt. Gènèràl ìnfò ànd bràndìng àrè stòrèd wìthòùt èncryptìòn sò pàgès vìsìblè bèfòrè sìgn-ìn càn dìsplày thèm. Tèrmìnòlògy ànd nòtè typès àrè èncryptèd wìth thè òrgànìzàtìòn kèy. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Settings that shape the whole workspace: general info, branding, terminology, encryption keys, data retention, note types, and intake form management. Genera..." |
*
* @param {Demo_Narrative_Admin_Hub_Org_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_org_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_Org_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_Org_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_org_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_hub_org_body(inputs)
	return en_demo_narrative_admin_hub_org_body(inputs)
});