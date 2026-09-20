/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_General_BodyInputs */

const en_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The general info section holds the organization name, country code, default interface language, and portal safe exit URL, and all four are stored as plaintext.
**Safe exit URL.** The server validates the URL scheme on read as well as on write, because the value becomes the destination of a navigation that replaces the page on the client quick exit path. A stored value that fails validation falls back to the client default.
**Persistence.** Changing the organization name also updates the branding display name so the two stay consistent.
**Permissions.** Editing general info requires the Manage organization identity permission.`)
};

const es_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de información general contiene el nombre de la organización, el código de país, el idioma predeterminado de la interfaz y la URL de salida rápida del portal, y los cuatro valores se almacenan en texto plano.
**URL de salida rápida.** El servidor valida el esquema de la URL tanto al leerla como al escribirla, porque el valor se convierte en el destino de una navegación que reemplaza la página en la ruta de salida rápida del cliente. Un valor almacenado que no pasa la validación se sustituye por el destino predeterminado del cliente.
**Persistencia.** Cambiar el nombre de la organización también actualiza el nombre visible en la marca para que ambos se mantengan coherentes.
**Permisos.** Editar la información general requiere el permiso Cambiar como se presenta la organización.`)
};

const en_xa2_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè gènèràl ìnfò sèctìòn hòlds thè òrgànìzàtìòn nàmè, còùntry còdè, dèfàùlt ìntèrfàcè làngùàgè, ànd pòrtàl sàfè èxìt ÙRL, ànd àll fòùr àrè stòrèd às plàìntèxt.
 ••••••••••••••••••••••••••••••••••••••••••••••••**Sàfè èxìt ÙRL. •••••** Thè sèrvèr vàlìdàtès thè ÙRL schèmè òn rèàd às wèll às òn wrìtè, bècàùsè thè vàlùè bècòmès thè dèstìnàtìòn òf à nàvìgàtìòn thàt rèplàcès thè pàgè òn thè clìènt qùìck èxìt pàth. À stòrèd vàlùè thàt fàìls vàlìdàtìòn fàlls bàck tò thè clìènt dèfàùlt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrsìstèncè. ••••** Chàngìng thè òrgànìzàtìòn nàmè àlsò ùpdàtès thè bràndìng dìsplày nàmè sò thè twò stày cònsìstènt.
 ••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Èdìtìng gènèràl ìnfò rèqùìrès thè Mànàgè òrgànìzàtìòn ìdèntìty pèrmìssìòn. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The general info section holds the organization name, country code, default interface language, and portal safe exit URL, and all four are stored as plaintex..." |
*
* @param {Demo_Narrative_Admin_General_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_general_body = /** @type {((inputs?: Demo_Narrative_Admin_General_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_General_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_general_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_general_body(inputs)
	return en_demo_narrative_admin_general_body(inputs)
});