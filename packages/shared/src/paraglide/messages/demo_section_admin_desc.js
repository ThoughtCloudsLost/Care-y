/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_DescInputs */

const en_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The admin hub holds the organization's settings and reporting pages, grouped into [People](#admin/hub-people), [Communications](#admin/hub-comms), [Organization](#admin/hub-org) and [Analytics](#admin/hub-analytics). Each destination requires its own permission, and a user who lacks a permission does not see that destination. The permission matrix is configurable per organization, so the set of destinations two roles see can differ. Some destinations carry a status figure that loads under the same permission as the destination itself. [The permission system](#deep-dive/the-permission-system) covers where permissions come from.`)
};

const es_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administración reúne las páginas de configuración e informes de la organización, agrupadas en [Personas](#admin/hub-people), [Comunicaciones](#admin/hub-comms), [Organización](#admin/hub-org) y [Analíticas](#admin/hub-analytics). Cada destino requiere su propio permiso, y quien no lo posee no ve ese destino. La matriz de permisos es configurable por organización, así que el conjunto de destinos que ven dos roles puede diferir. Algunos destinos muestran una cifra de estado que se carga con el mismo permiso del destino. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde salen los permisos.`)
};

const en_xa2_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè àdmìn hùb hòlds thè òrgànìzàtìòn's sèttìngs ànd rèpòrtìng pàgès, gròùpèd ìntò [Pèòplè](#àdmìn/hùb-pèòplè), [Còmmùnìcàtìòns](#àdmìn/hùb-còmms), [Òrgànìzàtìòn](#àdmìn/hùb-òrg) ànd [Ànàlytìcs](#àdmìn/hùb-ànàlytìcs). Èàch dèstìnàtìòn rèqùìrès ìts òwn pèrmìssìòn, ànd à ùsèr whò làcks à pèrmìssìòn dòès nòt sèè thàt dèstìnàtìòn. Thè pèrmìssìòn màtrìx ìs cònfìgùràblè pèr òrgànìzàtìòn, sò thè sèt òf dèstìnàtìòns twò ròlès sèè càn dìffèr. Sòmè dèstìnàtìòns càrry à stàtùs fìgùrè thàt lòàds ùndèr thè sàmè pèrmìssìòn às thè dèstìnàtìòn ìtsèlf. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs whèrè pèrmìssìòns còmè fròm. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The admin hub holds the organization's settings and reporting pages, grouped into [People](#admin/hub-people), [Communications](#admin/hub-comms), [Organizat..." |
*
* @param {Demo_Section_Admin_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_desc = /** @type {((inputs?: Demo_Section_Admin_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_desc(inputs)
	return en_demo_section_admin_desc(inputs)
});