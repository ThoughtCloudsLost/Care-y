/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_DescInputs */

const en_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The admin hub holds the organization's settings and reporting pages, grouped into [People](#admin/hub-people), [Communications](#admin/hub-comms), [Organization](#admin/hub-org) and [Analytics](#admin/hub-analytics). Each destination requires its own permission, and an account that lacks a permission does not see that destination. The permission matrix is configurable per organization, so the set of destinations two roles see can differ. An account holding the Manage roles permission also receives a status figure beside each destination; an account admitted by another permission alone reaches its destinations without those figures. [The permission system](#deep-dive/the-permission-system) covers where permissions come from.`)
};

const es_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administración reúne las páginas de configuración e informes de la organización, agrupadas en [Personas](#admin/hub-people), [Comunicaciones](#admin/hub-comms), [Organización](#admin/hub-org) y [Analíticas](#admin/hub-analytics). Cada destino requiere su propio permiso, y una cuenta que no lo posee no ve ese destino. La matriz de permisos es configurable por organización, así que el conjunto de destinos que ven dos roles puede diferir. Una cuenta con el permiso Gestionar roles también recibe una cifra de estado junto a cada destino; una cuenta admitida por otro permiso solo llega a sus destinos sin esas cifras. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde salen los permisos.`)
};

const en_xa2_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè àdmìn hùb hòlds thè òrgànìzàtìòn's sèttìngs ànd rèpòrtìng pàgès, gròùpèd ìntò [Pèòplè](#àdmìn/hùb-pèòplè), [Còmmùnìcàtìòns](#àdmìn/hùb-còmms), [Òrgànìzàtìòn](#àdmìn/hùb-òrg) ànd [Ànàlytìcs](#àdmìn/hùb-ànàlytìcs). Èàch dèstìnàtìòn rèqùìrès ìts òwn pèrmìssìòn, ànd àn àccòùnt thàt làcks à pèrmìssìòn dòès nòt sèè thàt dèstìnàtìòn. Thè pèrmìssìòn màtrìx ìs cònfìgùràblè pèr òrgànìzàtìòn, sò thè sèt òf dèstìnàtìòns twò ròlès sèè càn dìffèr. Àn àccòùnt hòldìng thè Mànàgè ròlès pèrmìssìòn àlsò rècèìvès à stàtùs fìgùrè bèsìdè èàch dèstìnàtìòn; àn àccòùnt àdmìttèd by ànòthèr pèrmìssìòn àlònè rèàchès ìts dèstìnàtìòns wìthòùt thòsè fìgùrès. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs whèrè pèrmìssìòns còmè fròm. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
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