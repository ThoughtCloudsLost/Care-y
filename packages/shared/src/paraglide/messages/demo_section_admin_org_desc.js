/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Org_DescInputs */

const en_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization section holds workspace-level settings that no single ticket or person owns. General info and branding are plaintext so the login page and client portal can display them before anyone signs in. Terminology, note type names, and note type icons are encrypted with the organization key. Note type notification targets are encrypted with the server's operational key, because the server reads them to route notifications. Retention windows are plaintext integers the server enforces directly. [How encryption works](#deep-dive/how-encryption-works) covers the organization key, and [The trust boundary](#deep-dive/the-trust-boundary) covers what the server's operational key protects.`)
};

const es_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de organización reúne ajustes que aplican a todo el espacio de trabajo y no pertenecen a ningún ticket ni persona individual. La marca y la información general son texto plano para que la página de inicio de sesión y el portal del cliente puedan mostrarlas antes de que alguien inicie sesión. La terminología, los nombres de tipo de nota y sus iconos se cifran con la clave de la organización. Los destinatarios de notificación de cada tipo de nota se cifran con la clave operativa del servidor, porque el servidor los lee para enrutar las notificaciones. Las ventanas de retención son valores en texto plano que el servidor aplica directamente. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización, y [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo que protege la clave operativa del servidor.`)
};

const en_xa2_demo_section_admin_org_desc = /** @type {(inputs: Demo_Section_Admin_Org_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè òrgànìzàtìòn sèctìòn hòlds wòrkspàcè-lèvèl sèttìngs thàt nò sìnglè tìckèt òr pèrsòn òwns. Gènèràl ìnfò ànd bràndìng àrè plàìntèxt sò thè lògìn pàgè ànd clìènt pòrtàl càn dìsplày thèm bèfòrè ànyònè sìgns ìn. Tèrmìnòlògy, nòtè typè nàmès, ànd nòtè typè ìcòns àrè èncryptèd wìth thè òrgànìzàtìòn kèy. Nòtè typè nòtìfìcàtìòn tàrgèts àrè èncryptèd wìth thè sèrvèr's òpèràtìònàl kèy, bècàùsè thè sèrvèr rèàds thèm tò ròùtè nòtìfìcàtìòns. Rètèntìòn wìndòws àrè plàìntèxt ìntègèrs thè sèrvèr ènfòrcès dìrèctly. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè òrgànìzàtìòn kèy, ànd [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs whàt thè sèrvèr's òpèràtìònàl kèy pròtècts. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The organization section holds workspace-level settings that no single ticket or person owns. General info and branding are plaintext so the login page and c..." |
*
* @param {Demo_Section_Admin_Org_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_org_desc = /** @type {((inputs?: Demo_Section_Admin_Org_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Org_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_org_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_org_desc(inputs)
	return en_demo_section_admin_org_desc(inputs)
});